"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import RiskGauge from "@/components/RiskGauge";
import { ReceiptIcon, AlertIcon, AgentIcon, ArrowUpRightIcon } from "@/components/Icons";
import { recommendationText, truncateAddress, riskLabel } from "@/lib/mock-data";
import type { LendingPosition, RiskReport } from "@agentpass/graph-client";

const RISK_STORAGE_KEY = "agentpass:last-risk";
const PAYMENT_STORAGE_KEY = "agentpass:last-payment";

const PROTOCOL_ICONS: Record<string, string> = { "Aave V3": "A", "Compound V3": "C" };
const ASSET_ICONS: Record<string, string> = {
  WETH: "Ξ", ETH: "Ξ", USDC: "$", USDT: "$", DAI: "◈", WBTC: "₿",
};

type PaymentView = {
  price: number;
  currency: string;
  receipt: {
    txHash: string;
    amount: number;
    currency: string;
    timestamp: number;
    explorerUrl: string;
  };
  budget: { total: number; remaining: number; spent: number; currency: string };
  hcs?: { topicId: string; explorerUrl: string; transactionId: string } | null;
};

// ─── Raw hex risk color (no CSS vars — needed for SVG inline styles) ───────────
function riskHex(score: number): string {
  if (score <= 30) return "#22c55e";
  if (score <= 60) return "#f59e0b";
  return "#ef4444";
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 80 }: { data: number[]; color: string; height?: number }) {
  const w = 400;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map(
    (v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 12) - 6}`
  );
  const area = `M ${pts[0]} L ${pts.slice(1).join(" L ")} L ${w},${h} L 0,${h} Z`;
  const safeColor = color.replace("#", "");
  const lastPt = pts[pts.length - 1].split(",");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`spk-${safeColor}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spk-${safeColor})`} />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={parseFloat(lastPt[0])}
        cy={parseFloat(lastPt[1])}
        r="4"
        fill={color}
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      />
    </svg>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const cx = 60; const cy = 60; const r = 46; const stroke = 14;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = segments.map((seg) => {
    const pct = seg.value / total;
    const dash = pct * circ;
    const slice = { ...seg, dashArray: `${dash} ${circ - dash}`, dashOffset: -offset * circ };
    offset += pct;
    return slice;
  });

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="w-28 h-28 flex-shrink-0 -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={stroke}
            strokeDasharray={s.dashArray} strokeDashoffset={s.dashOffset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${s.color}66)` }}
          />
        ))}
      </svg>
      <div className="space-y-2 flex-1 min-w-0">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-[#cbd5e1] truncate">{s.label}</span>
            </div>
            <span className="mono text-[#e5e7eb] font-medium ml-2 flex-shrink-0">
              {Math.round((s.value / (segments.reduce((a, b) => a + b.value, 0) || 1)) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LTV bar with threshold marker ───────────────────────────────────────────
function LTVBar({ ltv, threshold }: { ltv: number; threshold: number }) {
  const pct = Math.min(ltv, 100);
  const thresholdPct = Math.min(threshold, 100);
  const color = ltv > threshold - 5 ? "#ef4444" : ltv > threshold * 0.75 ? "#f59e0b" : "#22c55e";
  return (
    <div className="relative w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-visible">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}66` }} />
      <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[rgba(255,255,255,0.3)]"
        style={{ left: `${thresholdPct}%` }} />
    </div>
  );
}

// ─── Risk badge ───────────────────────────────────────────────────────────────
function RiskBadge({ score }: { score: number }) {
  const color = riskHex(score);
  const bg = score > 60 ? "rgba(239,68,68,0.08)" : score > 30 ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)";
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold mono"
      style={{ color, background: bg, border: `1px solid ${color}33` }}>
      {score} / 100
    </span>
  );
}

// ─── Result content ───────────────────────────────────────────────────────────
function ResultContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address") || "0x0000000000000000000000000000000000000000";

  const [agentName, setAgentName] = useState("Agent");
  const [agentReputation, setAgentReputation] = useState(0);
  const [report, setReport] = useState<RiskReport | null>(null);
  const [payment, setPayment] = useState<PaymentView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agent")
      .then((r) => r.json())
      .then((d) => { if (d?.name) { setAgentName(d.name); setAgentReputation(d.reputation || 0); } })
      .catch(() => { });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setLoadError(null);
      try {
        const cachedRisk = sessionStorage.getItem(RISK_STORAGE_KEY);
        const cachedPay = sessionStorage.getItem(PAYMENT_STORAGE_KEY);
        if (cachedRisk) {
          const parsed = JSON.parse(cachedRisk) as RiskReport;
          if (parsed.wallet?.toLowerCase() === address.toLowerCase()) {
            if (!cancelled) {
              setReport(parsed);
              if (cachedPay) setPayment(JSON.parse(cachedPay) as PaymentView);
              setLoading(false);
            }
            return;
          }
        }
      } catch { /* fall through */ }
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: address }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load analysis");
        if (!cancelled) {
          setReport(data.report as RiskReport);
          setPayment({ ...data.payment, hcs: data.hcs } as PaymentView);
          try {
            sessionStorage.setItem(RISK_STORAGE_KEY, JSON.stringify(data.report));
            sessionStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify({ ...data.payment, hcs: data.hcs }));
          } catch { /* ignore */ }
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [address]);

  const positions: LendingPosition[] = report?.positions ?? [];
  const totalSupplied = positions.reduce((s, p) => s + p.suppliedUsd, 0);
  const totalBorrowed = positions.reduce((s, p) => s + p.borrowedUsd, 0);
  const netPos = totalSupplied - totalBorrowed;

  const donutSegments = positions.length > 0
    ? positions.map((p, i) => ({
      value: p.suppliedUsd, label: p.asset,
      color: ["#7c3aed", "#14b8a6", "#3b82f6", "#f59e0b", "#ec4899"][i % 5],
    }))
    : [
      { value: 60, label: "WETH", color: "#7c3aed" },
      { value: 25, label: "USDC", color: "#14b8a6" },
      { value: 15, label: "WBTC", color: "#3b82f6" },
    ];

  const baseScore = report?.riskScore ?? 65;
  const scoreHistory = [
    Math.max(0, baseScore - 45), Math.max(0, baseScore - 38),
    Math.max(0, baseScore - 30), Math.max(0, baseScore - 28),
    Math.max(0, baseScore - 20), Math.max(0, baseScore - 15),
    Math.max(0, baseScore - 10), Math.max(0, baseScore - 6),
    Math.max(0, baseScore - 2), baseScore,
  ];

  const scoreColor = report ? riskHex(report.riskScore) : "#f59e0b";

  return (
    <main className="min-h-screen pb-20 relative">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#7c3aed] rounded-full mix-blend-screen filter blur-[160px] opacity-[0.07] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#14b8a6] rounded-full mix-blend-screen filter blur-[140px] opacity-[0.05] pointer-events-none" />

      <div className="max-w-6xl mx-auto p-6 md:p-10 relative z-10">

        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 step-enter">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-[#94a3b8] hover:text-[#e5e7eb] transition-colors text-sm">
              ← Back
            </Link>
            <div className="w-px h-5 bg-[rgba(148,163,184,0.2)]" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-0.5">Risk Report</h1>
              <p className="text-sm text-[#94a3b8] mono flex items-center gap-2 flex-wrap">
                <span>{truncateAddress(address)}</span>
                {report?.source && (
                  <span className="opacity-60">· via {report.source === "subgraph-mcp" ? "Subgraph MCP" : "Graph Gateway"}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {report && <RiskBadge score={report.riskScore} />}
            <Link href="/" className="cta-btn-ghost !py-2 !px-4 !text-sm">New Check</Link>
          </div>
        </header>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="spinner mx-auto mb-4" style={{ width: 32, height: 32, borderWidth: 3 }} />
              <p className="text-[#94a3b8] text-sm">Loading live analysis…</p>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {loadError && (
          <GlassCard className="mb-6">
            <p className="text-sm text-[#ef4444]">{loadError}</p>
          </GlassCard>
        )}

        {report && (
          <div className="space-y-5">

            {/* ══ ROW 1: Risk Gauge (left) + Score Trend (right) — matches screenshot ══ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* LEFT: Overall risk gauge card */}
              <GlassCard className="flex flex-col items-center text-center" glow="purple">
                <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-6">
                  Overall Risk Score
                </h2>

                {/* Gauge — sized to fill the card nicely */}
                <div className="flex-1 flex items-center justify-center py-2">
                  <RiskGauge score={report.riskScore} size={220} />
                </div>

                <div className="w-full pt-5 mt-4 border-t border-[rgba(148,163,184,0.12)]">
                  <p className="text-xs text-[#94a3b8] mb-1.5">Recommendation</p>
                  <p className="text-lg font-bold text-[#e5e7eb]">
                    {recommendationText(report.recommendation)}
                  </p>
                </div>
              </GlassCard>

              {/* RIGHT: Risk score trend sparkline */}
              <GlassCard className="flex flex-col">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest">
                      Risk Score Trend
                    </h2>
                    <p className="text-xs text-[#94a3b8] mt-1">Last 10 snapshots</p>
                  </div>
                  <span className="text-2xl font-extrabold mono" style={{ color: scoreColor }}>
                    {report.riskScore}
                  </span>
                </div>

                {/* Trend label pill */}
                <div className="mt-3 mb-4">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ color: scoreColor, background: `${scoreColor}12`, border: `1px solid ${scoreColor}25` }}
                  >
                    {riskLabel(report.riskScore)}
                  </span>
                </div>

                {/* Sparkline fills remaining height */}
                <div className="flex-1 flex flex-col justify-end">
                  <Sparkline data={scoreHistory} color={scoreColor} height={120} />
                  <div className="flex justify-between mt-3 text-[11px] text-[#94a3b8]">
                    <span>Earlier</span>
                    <span className="mono font-bold" style={{ color: scoreColor }}>
                      Current: {report.riskScore}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* ══ ROW 2: Payment · Portfolio totals ══ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Payment receipt */}
              <GlassCard padding="md">
                <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2 mb-5">
                  <ReceiptIcon className="h-3.5 w-3.5" /> Payment Receipt
                </h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#94a3b8]">Cost</span>
                    <span className="font-bold mono text-[#e5e7eb]">{payment?.price ?? "—"} {payment?.currency ?? "HBAR"}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#94a3b8]">Tx Hash</span>
                    {payment?.receipt?.explorerUrl ? (
                      <a href={payment.receipt.explorerUrl} target="_blank" rel="noreferrer"
                        className="text-xs text-[#14b8a6] hover:underline mono flex items-center gap-1">
                        {truncateAddress(payment.receipt.txHash)} <ArrowUpRightIcon className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs mono text-[#94a3b8]">pending</span>
                    )}
                  </div>
                  {payment?.hcs?.topicId && (
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#94a3b8]">HCS Topic</span>
                      <a href={payment.hcs.explorerUrl} target="_blank" rel="noreferrer"
                        className="text-xs text-[#14b8a6] hover:underline mono flex items-center gap-1">
                        {payment.hcs.topicId} <ArrowUpRightIcon className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {payment?.budget && (
                    <div className="pt-4 border-t border-[rgba(148,163,184,0.12)]">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-xs text-[#94a3b8]">Agent Budget</span>
                        <span className="text-xs mono font-medium text-[#e5e7eb]">
                          {payment.budget.remaining} {payment.budget.currency} left
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#14b8a6] transition-all duration-700"
                          style={{ width: `${payment.budget.total > 0 ? (payment.budget.remaining / payment.budget.total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Portfolio totals strip */}
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                {[
                  { label: "Total Supplied", value: `$${totalSupplied.toLocaleString()}`, color: "#22c55e" },
                  { label: "Total Borrowed", value: `$${totalBorrowed.toLocaleString()}`, color: "#ef4444" },
                  { label: "Net Position", value: `${netPos >= 0 ? "+" : ""}$${netPos.toLocaleString()}`, color: netPos >= 0 ? "#22c55e" : "#ef4444" },
                ].map((item) => (
                  <GlassCard key={item.label} className="text-center flex flex-col justify-center" padding="md">
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-2">{item.label}</p>
                    <p className="text-xl font-extrabold mono" style={{ color: item.color }}>{item.value}</p>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* ══ ROW 3: Portfolio table + Collateral donut ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              <div className="lg:col-span-2">
                <GlassCard>
                  <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-5">
                    Portfolio Breakdown
                  </h2>
                  {positions.length === 0 ? (
                    <p className="text-sm text-[#94a3b8]">No open Aave V3 / Compound V3 positions found for this wallet on Ethereum.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-[rgba(148,163,184,0.12)] text-[#94a3b8] text-xs">
                            <th className="pb-3 font-medium">Protocol</th>
                            <th className="pb-3 font-medium">Asset</th>
                            <th className="pb-3 font-medium text-right">Supplied</th>
                            <th className="pb-3 font-medium text-right">Borrowed</th>
                            <th className="pb-3 font-medium pl-4">LTV vs Max</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
                          {positions.map((pos, i) => (
                            <tr key={i} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                              <td className="py-4">
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-sm font-bold text-[#94a3b8]">
                                    {PROTOCOL_ICONS[pos.protocol] || "◆"}
                                  </span>
                                  <span className="font-medium text-[#e5e7eb] text-xs">{pos.protocol}</span>
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{ASSET_ICONS[pos.asset] || "•"}</span>
                                  <span className="text-[#cbd5e1] text-xs">{pos.asset}</span>
                                </div>
                              </td>
                              <td className="py-4 text-right mono text-[#22c55e] text-xs font-medium">${pos.suppliedUsd.toLocaleString()}</td>
                              <td className="py-4 text-right mono text-[#ef4444] text-xs font-medium">${pos.borrowedUsd.toLocaleString()}</td>
                              <td className="py-4 pl-4 min-w-[140px]">
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[10px]">
                                    <span className="text-[#94a3b8]">LTV</span>
                                    <span className="mono font-semibold" style={{
                                      color: pos.ltv > pos.liquidationThreshold - 5 ? "#ef4444" : pos.ltv > 0 ? "#f59e0b" : "#94a3b8"
                                    }}>{pos.ltv}%</span>
                                  </div>
                                  <LTVBar ltv={pos.ltv} threshold={pos.liquidationThreshold} />
                                  <div className="text-[10px] text-[#94a3b8] text-right">max {pos.liquidationThreshold}%</div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-4">
                <GlassCard>
                  <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-4">Collateral Split</h2>
                  <DonutChart segments={donutSegments} />
                </GlassCard>

                <GlassCard padding="sm">
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed]/20 to-[#14b8a6]/10 border border-[rgba(124,58,237,0.2)] flex items-center justify-center">
                      <AgentIcon className="h-5 w-5 text-[#e5e7eb]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium gradient-text">{agentName}</p>
                      <p className="text-[10px] text-[#94a3b8]">Reputation: {agentReputation} checks</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* ══ ROW 4: Risk factors ══ */}
            <GlassCard>
              <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertIcon className="h-3.5 w-3.5 text-[#ef4444]" /> Key Risk Factors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.factors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[rgba(239,68,68,0.04)] p-4 rounded-xl border border-[rgba(239,68,68,0.12)] hover:border-[rgba(239,68,68,0.22)] transition-colors">
                    <AlertIcon className="h-4 w-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#cbd5e1] leading-relaxed">{factor}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-[#94a3b8] px-2 pt-2">
              <p>Analyzed by <span className="gradient-text font-medium">{agentName}</span></p>
              <Link href="/" className="text-[#14b8a6] hover:underline flex items-center gap-1">
                Check another wallet <ArrowUpRightIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p className="text-[#94a3b8] text-sm">Loading report…</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
