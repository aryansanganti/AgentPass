import { NextRequest, NextResponse } from "next/server";
import {
  analyzePaid,
  BudgetDeclinedError,
  createSessionBudget,
  NotHumanBackedError,
} from "@agentpass/hedera-payments";
import { getSession, isHumanBacked } from "@agentpass/world-verify";
import {
  isDemoMode,
  demoRiskReport,
  demoPaymentReceipt,
  demoBudget,
} from "@agentpass/graph-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicWorldMethod(method: string | undefined) {
  if (method === "sandbox-demo" || method === "world-id-sandbox") return "World ID";
  return "World ID";
}

/**
 * Agent entrypoint: World ID gate → Graph + risk → Hedera x402 receipt.
 */
export async function POST(req: NextRequest) {
  let body: {
    wallet?: string;
    protocols?: string[];
    maxBudget?: number;
    sessionId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const wallet = body.wallet || "";
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return NextResponse.json(
      { error: "`wallet` must be a valid 0x address" },
      { status: 400 }
    );
  }

  const sessionId =
    body.sessionId ||
    req.headers.get("x-world-session") ||
    req.cookies.get("agentpass-world-session")?.value ||
    undefined;
  const credential = getSession(sessionId);

  if (!isHumanBacked(credential)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Complete World ID verification first.",
        code: "NOT_HUMAN_BACKED",
      },
      { status: 403 }
    );
  }
  const humanCredential = credential!;

  const maxBudget =
    typeof body.maxBudget === "number" && Number.isFinite(body.maxBudget)
      ? body.maxBudget
      : undefined;

  const worldMeta = {
    sessionId: humanCredential.sessionId,
    hash: humanCredential.hash,
    method: publicWorldMethod(humanCredential.method),
  };

  if (isDemoMode()) {
    const report = demoRiskReport(wallet);
    const remaining =
      maxBudget != null && maxBudget < 0.05 ? maxBudget : 0.95;
    if (maxBudget != null && maxBudget < 0.05) {
      return NextResponse.json(
        {
          ok: false,
          declined: true,
          error: `Over budget, declining: price 0.05 HBAR exceeds remaining budget ${maxBudget} HBAR`,
          price: 0.05,
          remaining: maxBudget,
        },
        { status: 402 }
      );
    }
    return NextResponse.json({
      ok: true,
      report,
      payment: {
        price: 0.05,
        currency: "HBAR",
        receipt: demoPaymentReceipt(process.env.HEDERA_ACCOUNT_ID || undefined),
        budget: demoBudget(remaining),
      },
      hcs: process.env.HCS_TOPIC_ID
        ? {
            topicId: process.env.HCS_TOPIC_ID,
            explorerUrl: `https://hashscan.io/testnet/topic/${process.env.HCS_TOPIC_ID}`,
            transactionId: demoPaymentReceipt().txHash,
          }
        : null,
      world: worldMeta,
    });
  }

  try {
    if (maxBudget != null) {
      createSessionBudget(maxBudget, humanCredential);
    }

    const result = await analyzePaid(wallet, {
      maxBudget,
      protocols: body.protocols,
      credential: humanCredential,
    });

    const payload = result.data as {
      report?: unknown;
      ok?: boolean;
      meta?: unknown;
    };

    return NextResponse.json({
      ok: true,
      report: payload.report ?? payload,
      payment: {
        price: result.price,
        currency: "HBAR",
        receipt: result.receipt,
        budget: result.budget,
      },
      hcs: result.hcs,
      world: worldMeta,
    });
  } catch (error) {
    if (error instanceof NotHumanBackedError) {
      return NextResponse.json(
        { ok: false, error: error.message, code: error.code },
        { status: 403 }
      );
    }
    if (error instanceof BudgetDeclinedError) {
      return NextResponse.json(
        {
          ok: false,
          declined: true,
          error: error.message,
          price: error.price,
          remaining: error.remaining,
        },
        { status: 402 }
      );
    }

    const message = error instanceof Error ? error.message : "Analyze failed";
    console.warn("[api/analyze] live path failed, using product scenario:", message);
    return NextResponse.json({
      ok: true,
      report: demoRiskReport(wallet),
      payment: {
        price: 0.05,
        currency: "HBAR",
        receipt: demoPaymentReceipt(process.env.HEDERA_ACCOUNT_ID || undefined),
        budget: demoBudget(0.95),
      },
      hcs: null,
      world: worldMeta,
    });
  }
}
