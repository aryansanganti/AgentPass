"use client";

import React, { Suspense, useCallback, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import ActivityLog from "@/components/ActivityLog";
import { MOCK_ACTIVITY_STEPS, type ActivityStep } from "@/lib/mock-data";
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

type AnalyzeDeclined = {
  ok: false;
  declined: true;
  error: string;
  price: number;
  remaining: number;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function CheckContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const address =
    searchParams.get("address") || "0x0000000000000000000000000000000000000000";
  const lowBudget = searchParams.get("lowBudget") === "1";
  const [agentName, setAgentName] = useState("Agent");
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<AnalyzeSuccess | null>(null);
  const fetchPromiseRef = useRef<Promise<AnalyzeSuccess> | null>(null);

  useEffect(() => {
    fetch("/api/agent")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.name) setAgentName(data.name);
      })
      .catch((err) => console.error(err));
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
        } catch {
          // ignore
        }
        return result;
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Analysis failed";
        setError(message);
        throw err;
      });
  }, [address, lowBudget]);

  const handleStep = useCallback(
    async (step: ActivityStep): Promise<string | void> => {
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
          if (step.id === "risk-compute") {
            return `Score ${report.riskScore}/100 — ${report.recommendation}`;
          }
          if (step.id === "pay-discover") {
            return `Price: ${payment.price} ${payment.currency} via x402 / Blocky402`;
          }
          if (step.id === "budget-check") {
            return `${payment.budget.remaining} ${payment.budget.currency} remaining after this call`;
          }
          if (step.id === "payment-confirm") {
            const tx = payment.receipt.txHash;
            return `tx: ${tx.slice(0, 28)}… — HashScan`;
          }
        } catch (err) {
          const declined = (err as { declined?: boolean })?.declined;
          const notHuman = (err as { notHumanBacked?: boolean })?.notHumanBacked;
          if (notHuman) {
            return "Blocked — complete World ID verification first";
          }
          if (declined && step.id === "budget-check") {
            return "Over budget — agent declined to pay";
          }
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-lg z-10 flex flex-col items-center">
        <div className="text-center mb-8 step-enter">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-glass)] shadow-lg mb-4">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Agent Working</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            {agentName} is analyzing the portfolio
            {lowBudget ? " (low-budget decline demo)" : ""}.
          </p>
        </div>

        <GlassCard className="w-full" padding="lg" glow="teal">
          <ActivityLog
            steps={MOCK_ACTIVITY_STEPS}
            onComplete={handleComplete}
            walletAddress={address}
            onStep={handleStep}
          />
        </GlassCard>

        {error && (
          <div className="mt-4 text-center max-w-md space-y-2">
            <p className="text-sm text-[var(--color-error)]">{error}</p>
            {/human-backed|World ID/i.test(error) && (
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-sm text-[var(--color-accent-teal)] hover:underline"
              >
                Go verify with World ID →
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => router.push("/")}
          className="mt-8 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Cancel Analysis
        </button>
      </div>
    </main>
  );
}

export default function LiveCheckPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">
          Loading...
        </div>
      }
    >
      <CheckContent />
    </Suspense>
  );
}
