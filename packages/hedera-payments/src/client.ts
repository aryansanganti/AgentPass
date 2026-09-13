import { wrapFetchWithPayment, decodePaymentResponseHeader } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactHederaScheme } from "@x402/hedera/exact/client";
import { createClientHederaSigner, PrivateKey } from "@x402/hedera";
import {
  ANALYZE_API_URL,
  DEFAULT_SESSION_BUDGET_HBAR,
  FACILITATOR_URL,
  HEDERA_ACCOUNT_ID,
  HEDERA_CAIP2,
  HEDERA_NETWORK,
  HEDERA_PRIVATE_KEY,
  assertPayerConfigured,
} from "./config";
import {
  AgentBudget,
  BudgetDeclinedError,
  createSessionBudget,
  unlockSessionBudget,
  getSessionBudget,
  NotHumanBackedError,
  type BudgetState,
} from "./budget";
import { logPaymentToHcs, type HcsLogEntry } from "./hcs-log";
import type { WorldCredential } from "@agentpass/world-verify";
import { requireHumanBacked } from "@agentpass/world-verify";

export interface PaymentReceipt {
  txHash: string;
  amount: number;
  currency: string;
  timestamp: number;
  explorerUrl: string;
  network: string;
  facilitator: string;
}

export interface PaidCallResult<T = unknown> {
  data: T;
  receipt: PaymentReceipt;
  budget: BudgetState;
  price: number;
  hcs?: HcsLogEntry | null;
  declined?: never;
}

function explorerUrl(txHash: string): string {
  const net = HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet";
  return `https://hashscan.io/${net}/transaction/${encodeURIComponent(txHash)}`;
}

function parseOperatorKey(raw: string): PrivateKey {
  try {
    return PrivateKey.fromStringECDSA(raw);
  } catch {
    try {
      return PrivateKey.fromStringED25519(raw);
    } catch {
      return PrivateKey.fromString(raw);
    }
  }
}

function tinybarsToHbar(amount: string | number): number {
  const n = typeof amount === "number" ? amount : Number(amount);
  return n / 100_000_000;
}

function extractPriceHbar(paymentRequired: unknown): number {
  const body = paymentRequired as {
    accepts?: Array<{ amount?: string; price?: string }>;
    amount?: string;
  };
  const amount =
    body?.accepts?.[0]?.amount ??
    body?.amount ??
    null;
  if (amount != null) return tinybarsToHbar(amount);
  return Number(process.env.ANALYZE_PRICE_HBAR || "0.05");
}

function extractTxFromHeaders(res: Response): string {
  const header =
    res.headers.get("PAYMENT-RESPONSE") ||
    res.headers.get("payment-response") ||
    res.headers.get("X-PAYMENT-RESPONSE");

  if (header) {
    try {
      const decoded = decodePaymentResponseHeader(header) as {
        transaction?: string;
        txHash?: string;
        settleResponse?: { transaction?: string };
      };
      const tx =
        decoded.transaction ||
        decoded.txHash ||
        decoded.settleResponse?.transaction;
      if (tx) return tx;
    } catch {
      // fall through
    }
  }
  return `pending-${Date.now()}`;
}

function buildPaidFetch() {
  assertPayerConfigured();
  const signer = createClientHederaSigner(
    HEDERA_ACCOUNT_ID,
    parseOperatorKey(HEDERA_PRIVATE_KEY),
    { network: HEDERA_CAIP2 }
  );
  const client = new x402Client().register(
    "hedera:*",
    new ExactHederaScheme(signer)
  ).setSpendControls({
    allowedAssets: [
      { network: HEDERA_CAIP2, asset: "0.0.0" },
    ],
  });
  return wrapFetchWithPayment(fetch, client);
}

/**
 * Discover → budget-check → pay via Blocky402 → retry paid endpoint.
 * Matches PRD 03 Step 5–6 flow.
 */
export async function callPaidEndpoint<T = unknown>(
  url: string,
  body: object,
  maxBudget?: number,
  opts?: {
    budget?: AgentBudget;
    /** World ID session credential — required to unlock spend */
    credential?: WorldCredential | null;
    logToHcs?: boolean;
    walletForHcs?: string;
    riskScoreForHcs?: number;
  }
): Promise<PaidCallResult<T>> {
  // Gate: no HBAR spend without human backing (PRD 04 → PRD 03)
  if (opts?.credential != null) {
    requireHumanBacked(opts.credential);
  } else if (!opts?.budget?.state.unlocked) {
    const existing = opts?.budget ?? getSessionBudget(DEFAULT_SESSION_BUDGET_HBAR);
    if (!existing.state.unlocked) {
      requireHumanBacked(null);
    }
  }

  const budget =
    opts?.budget ??
    (opts?.credential
      ? unlockSessionBudget(
        maxBudget ?? DEFAULT_SESSION_BUDGET_HBAR,
        opts.credential
      )
      : maxBudget != null
        ? createSessionBudget(maxBudget, opts?.credential)
        : getSessionBudget(DEFAULT_SESSION_BUDGET_HBAR));

  // 1) Cold call — expect 402 with pricing metadata
  const cold = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (cold.status !== 402 && cold.ok) {
    // Unusually unpaid success (middleware disabled) — treat as free
    const data = (await cold.json()) as T;
    return {
      data,
      receipt: {
        txHash: "free-no-402",
        amount: 0,
        currency: "HBAR",
        timestamp: Date.now(),
        explorerUrl: explorerUrl("free-no-402"),
        network: HEDERA_CAIP2,
        facilitator: FACILITATOR_URL,
      },
      budget: budget.state,
      price: 0,
      hcs: null,
    };
  }

  if (cold.status !== 402) {
    const text = await cold.text();
    throw new Error(`Unexpected response ${cold.status}: ${text.slice(0, 300)}`);
  }

  const paymentRequired = await cold.json();
  const price = extractPriceHbar(paymentRequired);

  // 2) Budget gate — decline path
  try {
    budget.assertCanAfford(price);
  } catch (err) {
    if (err instanceof BudgetDeclinedError) {
      console.warn(`[hedera-payments] ${err.message}`);
      throw err;
    }
    throw err;
  }

  // 3) Pay + retry via x402 fetch wrapper (signs, facilitator settle, X-PAYMENT retry)
  const fetchWithPay = buildPaidFetch();
  const paid = await fetchWithPay(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (!paid.ok) {
    const text = await paid.text();
    const responseHeader =
      paid.headers.get("PAYMENT-RESPONSE") ||
      paid.headers.get("payment-response") ||
      paid.headers.get("X-PAYMENT-RESPONSE");
    const detail = text || responseHeader || "empty response";
    throw new Error(`Paid request failed ${paid.status}: ${detail.slice(0, 500)}`);
  }

  const data = (await paid.json()) as T;
  const txHash = extractTxFromHeaders(paid);
  const after = budget.deduct(price);

  const receipt: PaymentReceipt = {
    txHash,
    amount: price,
    currency: "HBAR",
    timestamp: Date.now(),
    explorerUrl: explorerUrl(txHash),
    network: HEDERA_CAIP2,
    facilitator: FACILITATOR_URL,
  };

  let hcs: HcsLogEntry | null = null;
  if (opts?.logToHcs !== false) {
    try {
      const report = data as { report?: { riskScore?: number; wallet?: string } };
      hcs = await logPaymentToHcs({
        paymentTxHash: txHash,
        wallet:
          opts?.walletForHcs ||
          report?.report?.wallet ||
          (body as { wallet?: string }).wallet ||
          "unknown",
        riskScore:
          opts?.riskScoreForHcs ?? report?.report?.riskScore ?? 0,
        amountHbar: price,
      });
    } catch (err) {
      console.warn(
        "[hedera-payments] HCS log failed (non-fatal):",
        err instanceof Error ? err.message : err
      );
    }
  }

  return { data, receipt, budget: after, price, hcs };
}

/** Convenience: call the AgentPass /analyze endpoint with session budget. */
export async function analyzePaid(
  wallet: string,
  opts?: {
    maxBudget?: number;
    protocols?: string[];
    credential?: WorldCredential | null;
  }
) {
  return callPaidEndpoint(
    ANALYZE_API_URL,
    { wallet, protocols: opts?.protocols ?? ["aave", "compound"] },
    opts?.maxBudget,
    {
      walletForHcs: wallet,
      logToHcs: true,
      credential: opts?.credential,
    }
  );
}

export {
  BudgetDeclinedError,
  AgentBudget,
  createSessionBudget,
  unlockSessionBudget,
  getSessionBudget,
  NotHumanBackedError,
};
export type { BudgetState, HcsLogEntry };
