import { NextRequest, NextResponse } from "next/server";
import { analyzeWalletRisk } from "@agentpass/graph-client";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  const protocolsParam = req.nextUrl.searchParams.get("protocols");
  const protocols = protocolsParam
    ? protocolsParam.split(",").map((p) => p.trim()).filter(Boolean)
    : ["aave", "compound"];

  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return NextResponse.json(
      { error: "Query param `wallet` must be a valid 0x address" },
      { status: 400 }
    );
  }

  try {
    const report = await analyzeWalletRisk(wallet, protocols);
    return NextResponse.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Risk analysis failed";
    console.error("[api/risk]", message);
    const status = message.includes("GRAPH_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
