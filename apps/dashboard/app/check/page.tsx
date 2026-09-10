"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import ActivityLog from "@/components/ActivityLog";
import { MOCK_ACTIVITY_STEPS } from "@/lib/mock-data";

function CheckContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const address = searchParams.get("address") || "0x0000000000000000000000000000000000000000";
  const [agentName, setAgentName] = useState("Agent");

  useEffect(() => {
    fetch("/api/agent")
      .then(res => res.json())
      .then(data => {
        if (data && data.name) setAgentName(data.name);
      })
      .catch(err => console.error(err));
  }, []);

  const handleComplete = () => {
    // Navigate to results page after analysis completes
    router.push(`/result?address=${encodeURIComponent(address)}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-lg z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-8 step-enter">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-glass)] shadow-lg mb-4">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Agent Working</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            {agentName} is analyzing the portfolio.
          </p>
        </div>

        {/* Activity Log Card */}
        <GlassCard className="w-full" padding="lg" glow="teal">
          <ActivityLog 
            steps={MOCK_ACTIVITY_STEPS} 
            onComplete={handleComplete} 
            walletAddress={address}
          />
        </GlassCard>
        
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">
        Loading...
      </div>
    }>
      <CheckContent />
    </Suspense>
  );
}
