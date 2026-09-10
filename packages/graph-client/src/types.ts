export interface LendingPosition {
  protocol: string;
  asset: string;
  supplied: number;
  borrowed: number;
  suppliedUsd: number;
  borrowedUsd: number;
  ltv: number;
  liquidationThreshold: number;
  healthFactor: number;
}

export type RiskRecommendation = "reduce exposure" | "hold" | "safe";

export interface RiskReport {
  wallet: string;
  riskScore: number;
  factors: string[];
  recommendation: RiskRecommendation;
  timestamp: number;
  protocolsChecked: string[];
  totalSupplied: number;
  totalBorrowed: number;
  netPosition: number;
  positions: LendingPosition[];
  source: "subgraph-mcp" | "gateway-fallback";
}

export interface ProtocolSubgraph {
  id: string;
  name: string;
  /** Messari / Graph Network subgraph ID */
  subgraphId: string;
}

/** Known Messari standardized lending subgraphs on The Graph Network */
export const LENDING_SUBGRAPHS: Record<string, ProtocolSubgraph> = {
  aave: {
    id: "aave",
    name: "Aave V3",
    subgraphId: "HB1Z2EAw4rtPRYVb2Nz8QGFLHCpym6ByBX6vbCViuE9F",
  },
  compound: {
    id: "compound",
    name: "Compound V3",
    subgraphId: "AwoxEZbiWLvv6e3QdvdMZw4WDURdGbvPfHmZRc8Dpfz9",
  },
};
