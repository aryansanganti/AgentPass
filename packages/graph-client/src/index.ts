// @agentpass/graph-client
// Subgraph MCP wrapper + risk scoring engine
// Real implementation in Phase 3

export const GRAPH_PACKAGE_VERSION = "0.1.0";

export interface RiskReport {
  wallet: string;
  riskScore: number;       // 0-100
  factors: string[];       // e.g. "high LTV on Aave (82%)"
  recommendation: "reduce exposure" | "hold" | "safe";
}

export interface LendingPosition {
  protocol: string;
  asset: string;
  supplied: number;
  borrowed: number;
  ltv: number;
  liquidationThreshold: number;
}

export async function queryLendingPositions(
  wallet: string,
  protocols: string[]
): Promise<LendingPosition[]> {
  throw new Error("Not implemented — use mock data until Phase 3");
}

export function computeRisk(positions: LendingPosition[]): RiskReport {
  throw new Error("Not implemented — use mock data until Phase 3");
}
