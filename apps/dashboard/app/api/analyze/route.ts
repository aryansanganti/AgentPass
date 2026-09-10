import { NextRequest, NextResponse } from "next/server";
import {
  analyzePaid,
  BudgetDeclinedError,
  createSessionBudget,
  NotHumanBackedError,
} from "@agentpass/hedera-payments";
import { getSession, isHumanBacked } from "@agentpass/world-verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Agent entrypoint: World ID gate → discover 402 → budget check → pay on
 * Hedera testnet via Blocky402 → return live risk report + HashScan receipt.
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
    undefined;
  const credential = getSession(sessionId);

  if (!isHumanBacked(credential)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Agent is not human-backed. Complete World ID verification first.",
        code: "NOT_HUMAN_BACKED",
      },
      { status: 403 }
    );
  }

  const maxBudget =
    typeof body.maxBudget === "number" && Number.isFinite(body.maxBudget)
      ? body.maxBudget
      : undefined;

  try {
    if (maxBudget != null) {
      createSessionBudget(maxBudget, credential);
    }

    const result = await analyzePaid(wallet, {
      maxBudget,
      protocols: body.protocols,
      credential,
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
      world: {
        sessionId: credential.sessionId,
        hash: credential.hash,
        method: credential.method,
      },
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
    console.error("[api/analyze]", message);
    const status =
      message.includes("HEDERA_") || message.includes("not set") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
