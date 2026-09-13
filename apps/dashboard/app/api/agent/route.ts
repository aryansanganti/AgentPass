import { NextResponse } from "next/server";
import { getAgentIdentity } from "@agentpass/ens-identity";
import { getAgentBookStatus, AGENT_WALLET_ADDRESS } from "@agentpass/world-verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK = {
  name: "sentinel.agentpass.eth",
  parentName: "agentpass.eth",
  childName: "risk.sentinel.agentpass.eth",
  capabilities: ["defi-risk-analysis", "portfolio-query"],
  endpoint: "https://api.agentpass.eth/analyze",
  humanOwner: "0x7a3f8E2d1C9b4A5e6F0d7B8c9E1a2D3f4C5b6A7c",
  reputation: 14,
};

export async function GET() {
  try {
    const identity = await getAgentIdentity();
    const agentBook = await getAgentBookStatus({
      agentWallet: AGENT_WALLET_ADDRESS || undefined,
      ensName: identity.name,
    });

    return NextResponse.json({
      ...identity,
      agentBook: {
        ...agentBook,
        error: undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching agent identity:", error);
    return NextResponse.json(FALLBACK);
  }
}
