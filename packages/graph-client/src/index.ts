import { queryLendingPositions } from "./mcp";
import { computeRisk } from "./risk-engine";
import type { RiskReport } from "./types";

export const GRAPH_PACKAGE_VERSION = "0.1.0";

export type {
  LendingPosition,
  RiskRecommendation,
  RiskReport,
  ProtocolSubgraph,
} from "./types";

export { LENDING_SUBGRAPHS } from "./types";
export { queryLendingPositions, executeViaMcp, executeViaGateway, executeSubgraphQuery } from "./mcp";
export { computeRisk } from "./risk-engine";
export { lendingPositionsQuery } from "./queries/lending";
export { queryCache, TtlCache } from "./cache";

/**
 * End-to-end: live Subgraph MCP (or Gateway) positions → reasoned risk report.
 */
export async function analyzeWalletRisk(
  wallet: string,
  protocols: string[] = ["aave", "compound"]
): Promise<RiskReport> {
  const { positions, source } = await queryLendingPositions(wallet, protocols);
  return computeRisk(wallet, positions, {
    protocolsChecked: protocols.map((p) => {
      const k = p.toLowerCase();
      if (k.includes("aave")) return "Aave V3";
      if (k.includes("compound")) return "Compound V3";
      return p;
    }),
    source,
  });
}
