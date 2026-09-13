"use client";

import React, { Suspense, useCallback, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import ActivityLog from "@/components/ActivityLog";
import { AgentIcon, ShieldCheckIcon } from "@/components/Icons";
import { ACTIVITY_STEPS, type ActivityStep, truncateAddress } from "@/lib/mock-data";
import type { RiskReport } from "@agentpass/graph-client";

const RISK_STORAGE_KEY = "agentpass:last-risk";
const PAYMENT_STORAGE_KEY = "agentpass:last-payment";

type AnalyzeSuccess = {
  ok: true;
  report: RiskReport;
  payment: {
    price: number;
    currency: string;
    receipt: {
      txHash: string;
      amount: number;
      currency: string;
      timestamp: number;
      explorerUrl: string;
      network?: string;
    };
    budget: { total: number; remaining: number; spent: number; currency: string };
  };
  hcs?: { topicId: string; explorerUrl: string; transactionId: string } | null;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Step progress ring ───────────────────────────────────────────────────────
function ProgressRing({
  total,
  completed,
}: {
  total: number;
  completed: number;
}) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? completed / total : 0;
  const offset = circ * (1 - pct);

  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90">
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={r} fill="none"
        stroke="#14b8a6" strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)",
          filter: "drop-shadow(0 0 6px #14b8a6)",
        }}
      />
    </svg>
  );
}

// ─── Live step indicator dots ─────────────────────────────────────────────────
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-500"
          style={{
            width: i === current ? 16 : 6,
            height: 6,
            background:
              i < current
                ? "#22c55e"
                : i === current
                  ? "#14b8a6"
                  : "rgba(255,255,255,0.12)",
            boxShadow: i === current ? "0 0 8px #14b8a6" : undefined,
          }}
        />
      ))}
    </div>
  );
}

// ─── Animated background particles ───────────────────────────────────────────
function BgParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Purple orb top-left */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#14b8a6] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.12] float" />
      {/* Teal orb bottom-right */}
      <div
        className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#7c3aed] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.10] float"
        style={{ animationDelay: "-3s" }}
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 hero-grid opacity-40"
        style={{ maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)" }}
      />
    </div>
  );
}

// ─── Main check content ───────────────────────────────────────────────────────
function CheckContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const address = searchParams.get("address") || "0x0000000000000000000000000000000000000000";
  const lowBudget = searchParams.get("lowBudget") === "1";

  const [agentName, setAgentName] = useState("sentinel.agentpass.eth");
  const [error, setError] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const resultRef = useRef<AnalyzeSuccess | null>(null);
  const fetchPromiseRef = useRef<Promise<AnalyzeSuccess> | null>(null);

  useEffect(() => {
    fetch("/api/agent")
      .then((r) => r.json())
      .then((d) => { if (d?.name) setAgentName(d.name); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const sessionId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("agentpass:world-session")
        : null;

    fetchPromiseRef.current = fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionId ? { "x-world-session": sessionId } : {}),
      },
      body: JSON.stringify({
        wallet: address,
        sessionId: sessionId || undefined,
        ...(lowBudget ? { maxBudget: 0.01 } : {}),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.code === "NOT_HUMAN_BACKED" || res.status === 403) {
          throw Object.assign(
            new Error(data.error || "Complete World ID verification first"),
            { notHumanBacked: true, ...data }
          );
        }
        if (data.declined) {
          throw Object.assign(new Error(data.error || "Budget declined"), {
            declined: true,
            ...data,
          });
        }
        if (!res.ok) throw new Error(data.error || "Analyze API failed");
        return data as AnalyzeSuccess;
      })
      .then((result) => {
        resultRef.current = result;
        try {
          sessionStorage.setItem(RISK_STORAGE_KEY, JSON.stringify(result.report));
          sessionStorage.setItem(
            PAYMENT_STORAGE_KEY,
            JSON.stringify({ ...result.payment, hcs: result.hcs })
          );
        } catch { /* ignore */ }
        return result;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Analysis failed");
        throw err;
      });
  }, [address, lowBudget]);

  const handleStep = useCallback(
    async (step: ActivityStep, index: number): Promise<string | void> => {
      setCurrentStep(index);

      if (
        step.id === "graph-query" ||
        step.id === "risk-compute" ||
        step.id === "pay-discover" ||
        step.id === "budget-check" ||
        step.id === "payment-confirm"
      ) {
        if (!fetchPromiseRef.current) {
          await sleep(step.duration);
          return step.detail;
        }
        try {
          const result = await fetchPromiseRef.current;
          const { report, payment } = result;

          if (step.id === "graph-query") {
            const protocols = report.protocolsChecked?.join(", ") || "Aave, Compound";
            const count = report.positions?.length ?? 0;
            return `${count} position${count === 1 ? "" : "s"} · ${protocols} via The Graph`;
          }
          if (step.id === "risk-compute") return `Score ${report.riskScore}/100 — ${report.recommendation}`;
          if (step.id === "pay-discover") return `Price: ${payment.price} ${payment.currency} via x402 / Blocky402`;
          if (step.id === "budget-check") return `${payment.budget.remaining} ${payment.budget.currency} remaining after this call`;
          if (step.id === "payment-confirm") return `tx: ${payment.receipt.txHash.slice(0, 28)}… — HashScan`;
        } catch (err) {
          const e = err as { declined?: boolean; notHumanBacked?: boolean };
          if (e.notHumanBacked) return "Blocked — complete World ID verification first";
          if (e.declined && step.id === "budget-check") return "Over budget — agent declined to pay";
          if (step.id === "graph-query") return "Waiting on paid analyze…";
          return "Step failed — see error below";
        }
      }

      await sleep(step.duration);
      return step.detail;
    },
    []
  );

  const handleComplete = () => {
    if (error && !resultRef.current) return;
    router.push(`/result?address=${encodeURIComponent(address)}`);
  };

  const totalSteps = ACTIVITY_STEPS.length;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <BgParticles />

      <div className="w-full max-w-lg z-10">

        {/* ── Header ── */}
        <div className="text-center mb-8 step-enter">
          {/* Agent icon with glow ring */}
          <div className="relative mx-auto w-20 h-20 mb-5">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7c3aed]/30 to-[#14b8a6]/20 blur-xl" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[rgba(124,58,237,0.15)] to-[rgba(20,184,166,0.1)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center">
              <AgentIcon className="h-9 w-9 text-[#e5e7eb]" />
            </div>
            {/* Animated pulse ring */}
            <div className="absolute inset-0 rounded-2xl border border-[rgba(20,184,166,0.3)] pulse-glow" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Agent Working</h1>
          <p className="text-[#94a3b8] text-sm">
            <span className="gradient-text font-medium">{agentName}</span>{" "}
            is analyzing the portfolio
            {lowBudget ? " (low-budget decline demo)" : ""}.
          </p>

          {/* Wallet address pill */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.15)] text-xs text-[#94a3b8] mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] animate-pulse" />
            {truncateAddress(address)}
          </div>
        </div>

        {/* ── Progress header: ring + step dots ── */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3">
            <ProgressRing total={totalSteps} completed={completedCount} />
            <div>
              <p className="text-xs font-semibold text-[#e5e7eb]">
                Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
              </p>
              <p className="text-[10px] text-[#94a3b8] mt-0.5">
                {completedCount === totalSteps ? "Complete" : "In progress…"}
              </p>
            </div>
          </div>
          <StepDots total={totalSteps} current={currentStep} />
        </div>

        {/* ── Activity card ── */}
        <GlassCard className="w-full mb-4" padding="lg" glow="teal">
          <ActivityLog
            steps={ACTIVITY_STEPS}
            onComplete={() => {
              setCompletedCount(totalSteps);
              handleComplete();
            }}
            walletAddress={address}
            onStep={async (step, index) => {
              const detail = await handleStep(step, index);
              setCompletedCount((c) => c + 1);
              return detail;
            }}
          />
        </GlassCard>

        {/* ── What happens next ── */}
        {!error && completedCount < totalSteps && (
          <div className="glass-card p-4 mb-4 flex items-start gap-3">
            <ShieldCheckIcon className="h-4 w-4 text-[#7c3aed] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-[#e5e7eb]">What&apos;s happening</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Your agent is querying live Aave V3 &amp; Compound V3 data via The Graph,
                computing your risk score, then paying ~0.05 HBAR autonomously via Hedera x402.
              </p>
            </div>
          </div>
        )}

        {/* ── Error display ── */}
        {error && (
          <div className="glass-card p-4 mb-4 border border-[rgba(239,68,68,0.25)]">
            <p className="text-sm text-[#ef4444] text-center">{error}</p>
            {/human-backed|World ID/i.test(error) && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="text-sm text-[#14b8a6] hover:underline"
                >
                  Go verify with World ID →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Cancel ── */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-[#94a3b8] hover:text-[#e5e7eb] transition-colors"
          >
            ← Cancel Analysis
          </button>
        </div>
      </div>
    </main>
  );
}

export default function LiveCheckPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4" style={{ width: 32, height: 32 }} />
            <p className="text-[#94a3b8] text-sm">Loading…</p>
          </div>
        </div>
      }
    >
      <CheckContent />
    </Suspense>
  );
}
