// =============================================
// AgentPass — Mock Data Module
// All fake data in one place for Phase 1
// Each piece will be replaced by real data in Phases 2-6
// =============================================

// --- Agent Identity (PRD 01 — replaced in Phase 2) ---
export const MOCK_AGENT = {
  name: "sentinel.agentpass.eth",
  parentName: "agentpass.eth",
  childName: "risk.sentinel.agentpass.eth",
  capabilities: ["defi-risk-analysis", "portfolio-query"],
  endpoint: "https://api.agentpass.eth/analyze",
  humanOwner: "0x7a3f...b42c (World ID verified)",
  reputation: 14,
  roles: {
    owner: {
      address: "0x7a3f8E2d1C9b4A5e6F0d7B8c9E1a2D3f4C5b6A7c",
      label: "Human Owner",
      permissions: "Full control — all records, role management",
    },
    operator: {
      address: "0x1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0C",
      label: "Agent (Operator)",
      permissions: "Can write: agent.reputation, agent.last-active",
    },
    delegate: {
      address: "0x9f8E7d6C5b4A3f2E1d0C9b8A7f6E5d4C3b2A1f0E",
      label: "Sub-agent (Delegate)",
      permissions: "Read-only — no write access",
    },
  },
};

// --- Lending Positions (PRD 02 — replaced in Phase 3) ---
export interface MockPosition {
  protocol: string;
  protocolIcon: string;
  asset: string;
  assetIcon: string;
  supplied: number;
  suppliedUsd: number;
  borrowed: number;
  borrowedUsd: number;
  ltv: number;
  liquidationThreshold: number;
  healthFactor: number;
}

export const MOCK_POSITIONS: MockPosition[] = [
  {
    protocol: "Aave V3",
    protocolIcon: "🔷",
    asset: "WETH",
    assetIcon: "⟠",
    supplied: 4.2,
    suppliedUsd: 10080,
    borrowed: 6800,
    borrowedUsd: 6800,
    ltv: 82,
    liquidationThreshold: 85,
    healthFactor: 1.04,
  },
  {
    protocol: "Compound V3",
    protocolIcon: "🟢",
    asset: "USDC",
    assetIcon: "💲",
    supplied: 5000,
    suppliedUsd: 5000,
    borrowed: 2200,
    borrowedUsd: 2200,
    ltv: 44,
    liquidationThreshold: 80,
    healthFactor: 1.82,
  },
  {
    protocol: "Aave V3",
    protocolIcon: "🔷",
    asset: "DAI",
    assetIcon: "◈",
    supplied: 3500,
    suppliedUsd: 3500,
    borrowed: 0,
    borrowedUsd: 0,
    ltv: 0,
    liquidationThreshold: 77,
    healthFactor: Infinity,
  },
];

// --- Risk Report (PRD 02 — replaced in Phase 3) ---
export const MOCK_RISK_REPORT = {
  wallet: "",  // filled dynamically from user input
  riskScore: 72,
  factors: [
    "High LTV on Aave V3 WETH position (82%) — only 3% from liquidation threshold",
    "Concentrated exposure in ETH — 54% of supplied value in a single volatile asset",
    "Health factor 1.04 on primary position — dangerously close to liquidation",
    "No stablecoin hedge on largest borrowed position",
  ],
  recommendation: "reduce exposure" as const,
  timestamp: Date.now(),
  protocolsChecked: ["Aave V3", "Compound V3"],
  totalSupplied: 18580,
  totalBorrowed: 9000,
  netPosition: 9580,
};

// --- Payment (PRD 03 — replaced in Phase 4) ---
export const MOCK_PAYMENT = {
  price: 0.05,
  currency: "HBAR",
  priceUsd: 0.003,
  budget: {
    total: 1.0,
    remaining: 0.95,
    spent: 0.05,
  },
  receipt: {
    txHash: "0.0.12345@1694567890.123456789",
    explorerUrl: "https://hashscan.io/testnet/transaction/0.0.12345@1694567890.123456789",
    timestamp: Date.now(),
    status: "SUCCESS" as const,
  },
};

// --- World ID Verification (PRD 04 — replaced in Phase 5) ---
export const MOCK_VERIFICATION = {
  verified: true,
  method: "World ID Sandbox",
  hash: "0x8f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
  timestamp: Date.now() - 86400000, // verified 1 day ago
};

// --- Activity Log Steps (used by Live Check screen) ---
export interface ActivityStep {
  id: string;
  label: string;
  detail?: string;
  duration: number; // ms to simulate this step
  icon: "graph" | "compute" | "pay" | "budget" | "confirm" | "complete";
}

export const MOCK_ACTIVITY_STEPS: ActivityStep[] = [
  {
    id: "graph-query",
    label: "Querying The Graph",
    detail: "Aave V3, Compound V3 positions via Subgraph MCP",
    duration: 2200,
    icon: "graph",
  },
  {
    id: "risk-compute",
    label: "Computing risk score",
    detail: "Analyzing LTV ratios, health factors, concentration",
    duration: 1800,
    icon: "compute",
  },
  {
    id: "pay-discover",
    label: "Calling paid analysis endpoint",
    detail: `Price: ${0.05} HBAR (~$${0.003})`,
    duration: 800,
    icon: "pay",
  },
  {
    id: "budget-check",
    label: "Budget check passed",
    detail: "0.95 HBAR remaining after this call",
    duration: 600,
    icon: "budget",
  },
  {
    id: "payment-confirm",
    label: "Payment confirmed",
    detail: "tx: 0.0.12345@1694567890... — view on HashScan",
    duration: 2000,
    icon: "confirm",
  },
  {
    id: "analysis-complete",
    label: "Analysis complete",
    detail: "Risk score computed, recommendation ready",
    duration: 400,
    icon: "complete",
  },
];

// Helper: format wallet address for display
export function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper: risk score to color
export function riskColor(score: number): string {
  if (score <= 30) return "var(--color-risk-safe)";
  if (score <= 60) return "var(--color-risk-moderate)";
  return "var(--color-risk-danger)";
}

// Helper: risk score to label
export function riskLabel(score: number): string {
  if (score <= 30) return "Safe";
  if (score <= 60) return "Moderate";
  return "High Risk";
}

// Helper: risk recommendation to display text
export function recommendationText(
  rec: "reduce exposure" | "hold" | "safe"
): string {
  switch (rec) {
    case "reduce exposure":
      return "⚠️ Reduce Exposure";
    case "hold":
      return "🔶 Hold & Monitor";
    case "safe":
      return "✅ Position is Safe";
  }
}
