import { NextResponse } from "next/server";
import { getAgentIdentity } from "@agentpass/ens-identity";
import { getAgentBookStatus, AGENT_WALLET_ADDRESS } from "@agentpass/world-verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const identity = await getAgentIdentity();
    const agentBook = await getAgentBookStatus({
      agentWallet: AGENT_WALLET_ADDRESS || undefined,
      ensName: identity.name,
    });

    return NextResponse.json({
      ...identity,
      agentBook,
      humanVerifiedLabel: agentBook.registered
        ? `AgentBook human ${agentBook.humanId?.slice(0, 10)}…`
        : identity.humanOwner,
    });
  } catch (error) {
    console.error("Error fetching agent identity:", error);
    return NextResponse.json({ error: "Failed to fetch identity" }, { status: 500 });
  }
}
