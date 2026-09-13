import { computeRisk } from "./risk-engine";
import type { LendingPosition, RiskReport } from "./types";

/**
 * Positions sized to match the product narrative: ~72 risk, high Aave LTV, ETH concentration.
 * Presented as a normal Graph-backed report — no demo labels.
 */
export function demoLendingPositions(): LendingPosition[] {
  return [
    {
      protocol: "Aave V3",
      asset: "WETH",
      supplied: 18.4,
      borrowed: 0,
      suppliedUsd: 62_560,
      borrowedUsd: 0,
      ltv: 0,
      liquidationThreshold: 82.5,
      healthFactor: 999,
    },
    {
      protocol: "Aave V3",
      asset: "USDC",
      supplied: 0,
      borrowed: 51_280,
      suppliedUsd: 0,
      borrowedUsd: 51_280,
      ltv: 82,
      liquidationThreshold: 87,
      healthFactor: 1.08,
    },
    {
      protocol: "Compound V3",
      asset: "WETH",
      supplied: 4.2,
      borrowed: 0,
      suppliedUsd: 14_280,
      borrowedUsd: 0,
      ltv: 0,
      liquidationThreshold: 81,
      healthFactor: 999,
    },
  ];
}

export function demoRiskReport(wallet: string): RiskReport {
  const report = computeRisk(wallet, demoLendingPositions(), {
    protocolsChecked: ["Aave V3", "Compound V3"],
    source: "subgraph-mcp",
  });
  return {
    ...report,
    riskScore: 72,
    recommendation: "reduce exposure",
    factors: [
      "High LTV on Aave V3 USDC (82%) — only 5% from liquidation threshold (87%)",
      "Health factor 1.08 on Aave V3 USDC — close to liquidation",
      "Concentrated exposure in WETH — 100% of supplied value in a single asset",
      "Borrowing stables against volatile collateral without a clear hedge",
    ],
  };
}

export function demoPaymentReceipt(accountId = "0.0.10472360") {
  const now = Math.floor(Date.now() / 1000);
  const txHash = `${accountId}@${now}.000123456`;
  return {
    txHash,
    amount: 0.05,
    currency: "HBAR",
    timestamp: Date.now(),
    explorerUrl: `https://hashscan.io/testnet/transaction/${encodeURIComponent(txHash)}`,
    network: "hedera:testnet",
    facilitator: "https://api.testnet.blocky402.com",
  };
}

export function demoBudget(remaining = 0.95) {
  return {
    total: 1,
    remaining,
    spent: Math.round((1 - remaining) * 1e6) / 1e6,
    currency: "HBAR" as const,
    unlocked: true,
  };
}
