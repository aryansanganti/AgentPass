"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import RiskGauge from "@/components/RiskGauge";
import { MOCK_RISK_REPORT, MOCK_POSITIONS, MOCK_PAYMENT, recommendationText, truncateAddress } from "@/lib/mock-data";

function ResultContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address") || "0x0000000000000000000000000000000000000000";

  const [agentName, setAgentName] = useState("Agent");
  const [agentReputation, setAgentReputation] = useState(0);

  useEffect(() => {
    fetch("/api/agent")
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setAgentName(data.name);
          setAgentReputation(data.reputation || 0);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <main className="min-h-screen p-6 md:p-10 relative max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-10 step-enter">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-1">Risk Report</h1>
          <p className="text-sm text-[var(--color-text-muted)] mono">
            Target: {truncateAddress(address)}
          </p>
        </div>
        
        <Link 
          href="/"
          className="px-4 py-2 bg-[var(--color-bg-glass)] hover:bg-[var(--color-bg-glass-hover)] border border-[var(--color-border-glass)] rounded-lg text-sm font-medium transition-colors"
        >
          New Check
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Score & Action */}
        <div className="flex flex-col gap-6 lg:col-span-1 step-enter" style={{ animationDelay: "0.1s" }}>
          <GlassCard className="flex flex-col items-center text-center" glow="purple">
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-6">Overall Risk</h2>
            
            <div className="mb-6">
              <RiskGauge score={MOCK_RISK_REPORT.riskScore} size={220} />
            </div>

            <div className="w-full pt-6 border-t border-[var(--color-border-subtle)]">
              <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Recommendation</h3>
              <p className="text-lg font-medium text-[var(--color-text-primary)]">
                {recommendationText(MOCK_RISK_REPORT.recommendation)}
              </p>
            </div>
          </GlassCard>

          {/* Receipt Card */}
          <GlassCard className="flex flex-col gap-4" padding="md">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span>🧾</span> Payment Receipt
            </h3>
            
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-[var(--color-text-muted)]">Cost</span>
              <span className="font-medium mono">{MOCK_PAYMENT.price} {MOCK_PAYMENT.currency}</span>
            </div>
            
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-[var(--color-text-muted)]">Tx Hash</span>
              <a 
                href={MOCK_PAYMENT.receipt.explorerUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-[var(--color-accent-teal)] hover:underline mono"
              >
                {truncateAddress(MOCK_PAYMENT.receipt.txHash)} ↗
              </a>
            </div>
            
            <div className="pt-4 mt-2 border-t border-[var(--color-border-subtle)]">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-[var(--color-text-muted)]">Agent Budget</span>
                <span className="text-xs font-medium mono">{MOCK_PAYMENT.budget.remaining} {MOCK_PAYMENT.currency} left</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--color-accent-purple)]" 
                  style={{ width: `${(MOCK_PAYMENT.budget.remaining / MOCK_PAYMENT.budget.total) * 100}%` }}
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column - Details */}
        <div className="flex flex-col gap-6 lg:col-span-2 step-enter" style={{ animationDelay: "0.2s" }}>
          
          {/* Key Risk Factors */}
          <GlassCard>
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
              Key Risk Factors
            </h2>
            <ul className="space-y-3">
              {MOCK_RISK_REPORT.factors.map((factor, i) => (
                <li key={i} className="flex items-start gap-3 bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-[var(--color-border-subtle)]">
                  <span className="mt-0.5 text-[var(--color-error)]">⚠️</span>
                  <span className="text-sm text-[var(--color-text-primary)] leading-relaxed">{factor}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Portfolio Breakdown */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Portfolio Breakdown
              </h2>
              <span className="text-xs bg-[var(--color-bg-glass)] px-2 py-1 rounded border border-[var(--color-border-subtle)] mono text-[var(--color-text-muted)]">
                Net: ${(MOCK_RISK_REPORT.netPosition).toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
                    <th className="pb-3 font-medium">Protocol</th>
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium text-right">Supplied</th>
                    <th className="pb-3 font-medium text-right">Borrowed</th>
                    <th className="pb-3 font-medium text-right">LTV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {MOCK_POSITIONS.map((pos, i) => (
                    <tr key={i} className="group">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{pos.protocolIcon}</span>
                          <span className="font-medium text-[var(--color-text-primary)]">{pos.protocol}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span>{pos.assetIcon}</span>
                          <span>{pos.asset}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right mono text-[var(--color-success)]">
                        ${pos.suppliedUsd.toLocaleString()}
                      </td>
                      <td className="py-4 text-right mono text-[var(--color-error)]">
                        ${pos.borrowedUsd.toLocaleString()}
                      </td>
                      <td className="py-4 text-right">
                        <span className={`px-2 py-1 rounded text-xs mono ${
                          pos.ltv > pos.liquidationThreshold - 5 ? 'bg-[rgba(239,68,68,0.1)] text-[var(--color-error)] border border-[rgba(239,68,68,0.2)]' :
                          pos.ltv > 0 ? 'bg-[rgba(245,158,11,0.1)] text-[var(--color-warning)] border border-[rgba(245,158,11,0.2)]' :
                          'text-[var(--color-text-muted)]'
                        }`}>
                          {pos.ltv}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Agent Footer Info */}
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] px-2">
            <p>Analyzed by <span className="gradient-text font-medium">{agentName}</span></p>
            <p>Reputation: {agentReputation} checks</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">
        Loading...
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
