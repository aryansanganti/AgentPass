import { NextRequest, NextResponse } from "next/server";
import {
  verifyHuman,
  getAgentBookStatus,
  type WorldCredential,
} from "@agentpass/world-verify";
import {
  unlockSessionBudget,
  DEFAULT_SESSION_BUDGET_HBAR,
} from "@agentpass/hedera-payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Complete World ID verification (portal proof or labeled sandbox demo),
 * mint a session, unlock Hedera budget (PRD 00 Step 2 → Step 4 payments).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      idkitResponse?: Record<string, unknown>;
      forceSandboxDemo?: boolean;
      agentWallet?: `0x${string}`;
      ensName?: string;
      maxBudget?: number;
    };

    const useSandbox =
      body.forceSandboxDemo === true || body.idkitResponse == null;

    const credential: WorldCredential = await verifyHuman({
      idkitResponse: body.idkitResponse as never,
      forceSandboxDemo: useSandbox,
      agentWallet: body.agentWallet,
    });

    const budgetTotal =
      typeof body.maxBudget === "number" && Number.isFinite(body.maxBudget)
        ? body.maxBudget
        : DEFAULT_SESSION_BUDGET_HBAR;

    const budget = unlockSessionBudget(budgetTotal, credential);
    const agentBook = await getAgentBookStatus({
      agentWallet: body.agentWallet,
      ensName: body.ensName,
    });

    return NextResponse.json({
      ok: true,
      credential,
      sessionId: credential.sessionId,
      budget: budget.state,
      agentBook,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "World verification failed";
    console.error("[api/world/verify]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
