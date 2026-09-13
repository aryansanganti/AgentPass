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

// --- Lending Positions / Risk Report (PRD 02 — LIVE via /api/risk + @agentpass/graph-client) ---
// MOCK_POSITIONS / MOCK_RISK_REPORT removed in Phase 3.

// --- Payment (PRD 03 — LIVE via /api/analyze + @agentpass/hedera-payments) ---
// MOCK_PAYMENT removed in Phase 4; receipt comes from sessionStorage / API.

// --- World ID Verification (PRD 04 — live via /api/world/*) ---
// MOCK_VERIFICATION removed in Phase 5; credential comes from sessionStorage.

// --- Activity Log Steps (used by Live Check screen) ---
export interface ActivityStep {
  id: string;
  label: string;
  detail?: string;
  duration: number; // ms to simulate this step
  icon: "graph" | "compute" | "pay" | "budget" | "confirm" | "complete";
}

export const ACTIVITY_STEPS: ActivityStep[] = [
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
    detail: "Price: 0.05 HBAR via x402 / Blocky402",
    duration: 800,
    icon: "pay",
  },
  {
    id: "budget-check",
    label: "Budget check",
    detail: "Agent session budget vs quote",
    duration: 600,
    icon: "budget",
  },
  {
    id: "payment-confirm",
    label: "Payment confirmed",
    detail: "Hedera testnet tx — view on HashScan",
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
      return "Reduce Exposure";
    case "hold":
      return "Hold & Monitor";
    case "safe":
      return "Position is Safe";
  }
}
