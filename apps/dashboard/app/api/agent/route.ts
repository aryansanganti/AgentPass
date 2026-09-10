import { NextResponse } from "next/server";
import { getAgentIdentity } from "@agentpass/ens-identity";

export async function GET() {
  try {
    const identity = await getAgentIdentity();
    return NextResponse.json(identity);
  } catch (error) {
    console.error("Error fetching agent identity:", error);
    return NextResponse.json({ error: "Failed to fetch identity" }, { status: 500 });
  }
}
