"use client";

import React, { useState, useEffect } from "react";
import GlassCard from "@/components/GlassCard";
import WalletInput from "@/components/WalletInput";
import AgentProfile from "@/components/AgentProfile";
import { MOCK_VERIFICATION } from "@/lib/mock-data";

export default function Home() {
  const [isAgentProfileOpen, setIsAgentProfileOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [agentName, setAgentName] = useState("Loading Agent...");

  useEffect(() => {
    fetch("/api/agent")
      .then(res => res.json())
      .then(data => {
        if (data && data.name) setAgentName(data.name);
      })
      .catch(err => {
        console.error(err);
        setAgentName("Agent Offline");
      });
  }, []);

  const handleVerify = () => {
    setShowVerifyModal(true);
    // Simulate verification delay
    setTimeout(() => {
      setIsVerified(true);
      setShowVerifyModal(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--color-accent-purple)] rounded-full mix-blend-screen filter blur-[120px] opacity-20 float" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--color-accent-teal)] rounded-full mix-blend-screen filter blur-[120px] opacity-20 float" style={{ animationDelay: "-3s" }} />

      <div className="w-full max-w-2xl z-10 flex flex-col items-center step-enter">
        {/* Verification Badge */}
        <div className="mb-8">
          {isVerified ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[var(--color-success)] text-sm font-medium">
              <span className="text-lg">🆔</span>
              Human Verified
              <span className="text-xs ml-1 opacity-80 mono">({MOCK_VERIFICATION.hash.slice(0, 8)})</span>
            </div>
          ) : (
            <button
              onClick={handleVerify}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border-glass)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-accent)] transition-all text-sm font-medium btn-glow"
            >
              <span className="text-lg">👁️</span>
              Verify with World ID
            </button>
          )}
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            DeFi Risk <br />
            <span className="gradient-text">Managed by AI</span>
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-lg mx-auto leading-relaxed">
            An autonomous agent that checks your portfolio risk — verified human, paid per use, no API keys.
          </p>
        </div>

        {/* Main Input Card */}
        <GlassCard className="w-full mb-8" glow={isVerified ? "purple" : "none"}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent-purple)] to-[var(--color-accent-teal)] flex items-center justify-center shadow-lg">
                🤖
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Your Agent</p>
                <button
                  onClick={() => setIsAgentProfileOpen(true)}
                  className="text-sm font-medium gradient-text hover:opacity-80 transition-opacity flex items-center gap-1"
                >
                  {agentName} <span className="text-[10px]">↗</span>
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Budget</p>
              <p className="text-sm font-medium text-[var(--color-text-primary)] mono">1.0 HBAR</p>
            </div>
          </div>

          <div className="relative group">
            <div className={`absolute -inset-1 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-teal)] ${!isVerified && 'hidden'}`}></div>
            <div className="relative">
              {isVerified ? (
                <WalletInput />
              ) : (
                <div className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--color-border-glass)] rounded-xl py-4 px-6 text-center text-[var(--color-text-muted)]">
                  Verify you're human to unlock the agent
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Footer Features */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-[var(--color-text-muted)] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-purple)]" /> ENS Identity
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-teal)]" /> The Graph Data
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-blue)]" /> Hedera x402
          </div>
        </div>
      </div>

      {/* Verification Modal overlay */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <GlassCard padding="lg" className="w-full max-w-sm text-center step-enter">
            <div className="text-5xl mb-4 float">👁️</div>
            <h3 className="text-xl font-bold mb-2">World ID Sandbox</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              Simulating proof of personhood...
            </p>
            <div className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-text-primary)] w-1/2 animate-[shimmer_1s_infinite]" />
            </div>
          </GlassCard>
        </div>
      )}

      {/* Agent Profile Modal */}
      <AgentProfile isOpen={isAgentProfileOpen} onClose={() => setIsAgentProfileOpen(false)} />
    </main>
  );
}
