import type { LendingPosition, RiskRecommendation, RiskReport } from "./types";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Meaningful reasoning over live lending positions — not a raw query dump.
 * Scores 0–100 where higher = more liquidation / concentration risk.
 */
export function computeRisk(
  wallet: string,
  positions: LendingPosition[],
  opts?: {
    protocolsChecked?: string[];
    source?: RiskReport["source"];
  }
): RiskReport {
  const protocolsChecked =
    opts?.protocolsChecked ??
    Array.from(new Set(positions.map((p) => p.protocol)));

  const totalSupplied = positions.reduce((s, p) => s + p.suppliedUsd, 0);
  const totalBorrowed = positions.reduce((s, p) => s + p.borrowedUsd, 0);
  const netPosition = Math.round((totalSupplied - totalBorrowed) * 100) / 100;

  if (positions.length === 0 || totalSupplied === 0) {
    return {
      wallet,
      riskScore: 5,
      factors: [
        "No open lending positions found on queried protocols",
        "Wallet may have no Aave/Compound exposure on Ethereum mainnet",
      ],
      recommendation: "safe",
      timestamp: Date.now(),
      protocolsChecked,
      totalSupplied: 0,
      totalBorrowed: 0,
      netPosition: 0,
      positions: [],
      source: opts?.source ?? "subgraph-mcp",
    };
  }

  const overallLtv = (totalBorrowed / totalSupplied) * 100;
  const factors: string[] = [];
  let score = 0;

  // --- LTV contribution (0–40) ---
  const ltvScore = clamp((overallLtv / 85) * 40, 0, 40);
  score += ltvScore;
  if (overallLtv >= 70) {
    factors.push(
      `High portfolio LTV (${overallLtv.toFixed(1)}%) — elevated liquidation risk`
    );
  } else if (overallLtv >= 40) {
    factors.push(`Moderate portfolio LTV (${overallLtv.toFixed(1)}%)`);
  }

  // --- Health factor / proximity to liquidation (0–35) ---
  const borrowedPositions = positions.filter((p) => p.borrowedUsd > 0);
  let worstHf = Infinity;
  let worstPos: LendingPosition | null = null;

  for (const p of borrowedPositions) {
    if (p.healthFactor < worstHf) {
      worstHf = p.healthFactor;
      worstPos = p;
    }

    const buffer = p.liquidationThreshold - p.ltv;
    if (buffer <= 5 && p.liquidationThreshold > 0) {
      factors.push(
        `High LTV on ${p.protocol} ${p.asset} (${p.ltv}%) — only ${buffer.toFixed(1)}% from liquidation threshold (${p.liquidationThreshold}%)`
      );
    }

    if (p.healthFactor < 1.15) {
      factors.push(
        `Health factor ${p.healthFactor} on ${p.protocol} ${p.asset} — dangerously close to liquidation`
      );
    }
  }

  if (Number.isFinite(worstHf)) {
    if (worstHf < 1.05) score += 35;
    else if (worstHf < 1.2) score += 28;
    else if (worstHf < 1.5) score += 18;
    else if (worstHf < 2) score += 10;
    else score += 4;
  }

  // --- Concentration (0–25) ---
  const byAsset = new Map<string, number>();
  for (const p of positions) {
    byAsset.set(p.asset, (byAsset.get(p.asset) || 0) + p.suppliedUsd);
  }
  let topAsset = "";
  let topShare = 0;
  for (const [asset, usd] of byAsset) {
    const share = usd / totalSupplied;
    if (share > topShare) {
      topShare = share;
      topAsset = asset;
    }
  }

  if (topShare >= 0.5) {
    score += 25 * topShare;
    factors.push(
      `Concentrated exposure in ${topAsset} — ${(topShare * 100).toFixed(0)}% of supplied value in a single asset`
    );
  } else if (topShare >= 0.35) {
    score += 12;
    factors.push(
      `${topAsset} is ${(topShare * 100).toFixed(0)}% of supplied collateral — watch concentration`
    );
  }

  // Stablecoin borrow without stable collateral hedge signal
  const volatileCollateral = positions.filter(
    (p) =>
      p.suppliedUsd > 0 &&
      !["USDC", "USDT", "DAI", "FRAX", "GHO"].includes(p.asset.toUpperCase())
  );
  const stableBorrow = positions.filter(
    (p) =>
      p.borrowedUsd > 0 &&
      ["USDC", "USDT", "DAI", "FRAX", "GHO"].includes(p.asset.toUpperCase())
  );
  if (volatileCollateral.length && stableBorrow.length && overallLtv > 50) {
    factors.push("Borrowing stables against volatile collateral without a clear hedge");
    score += 5;
  }

  if (worstPos && Number.isFinite(worstHf) && worstHf >= 1.5 && overallLtv < 40) {
    factors.push(
      `Primary borrow health factor ${worstHf} on ${worstPos.protocol} — currently comfortable`
    );
  }

  if (factors.length === 0) {
    factors.push("Diversified positions with healthy LTV and liquidation buffers");
  }

  score = Math.round(clamp(score, 0, 100));

  let recommendation: RiskRecommendation = "safe";
  if (score >= 65) recommendation = "reduce exposure";
  else if (score >= 35) recommendation = "hold";

  return {
    wallet,
    riskScore: score,
    factors: factors.slice(0, 6),
    recommendation,
    timestamp: Date.now(),
    protocolsChecked,
    totalSupplied: Math.round(totalSupplied * 100) / 100,
    totalBorrowed: Math.round(totalBorrowed * 100) / 100,
    netPosition,
    positions,
    source: opts?.source ?? "subgraph-mcp",
  };
}
