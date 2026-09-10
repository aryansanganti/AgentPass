"use client";

import React, { useState, useEffect } from "react";
import GlassCard from "@/components/GlassCard";
import WalletInput from "@/components/WalletInput";
import AgentProfile from "@/components/AgentProfile";
import WorldVerifyModal, {
  loadStoredCredential,
  loadStoredWorldSession,
  type WorldVerifyCredential,
} from "@/components/WorldVerifyModal";

export default function Home() {
  const [isAgentProfileOpen, setIsAgentProfileOpen] = useState(false);
  const [credential, setCredential] = useState<WorldVerifyCredential | null>(
    null
  );
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [agentName, setAgentName] = useState("Loading Agent...");

  const isVerified = Boolean(credential?.verified && credential.hash);

  useEffect(() => {
    const stored = loadStoredCredential();
    const sessionId = loadStoredWorldSession();
    if (stored?.verified && sessionId) {
      setCredential(stored);
      // Re-validate against server session store
      fetch(`/api/world/session?sessionId=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.verified && data.credential) {
            setCredential(data.credential);
          }
        })
        .catch(() => {
          /* keep local credential for UX */
        });
    }

    fetch("/api/agent")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.name) setAgentName(data.name);
      })
      .catch(() => {
        setAgentName("Agent Offline");
      });
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--color-accent-purple)] rounded-full mix-blend-screen filter blur-[120px] opacity-20 float" />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--color-accent-teal)] rounded-full mix-blend-screen filter blur-[120px] opacity-20 float"
        style={{ animationDelay: "-3s" }}
      />

      <div className="w-full max-w-2xl z-10 flex flex-col items-center step-enter">
        <div className="mb-8">
          {isVerified ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[var(--color-success)] text-sm font-medium">
              <span className="text-lg">🆔</span>
              Human Verified
              <span className="text-xs ml-1 opacity-80 mono">
                ({credential!.hash.slice(0, 10)}…)
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border-glass)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-accent)] transition-all text-sm font-medium btn-glow"
            >
              <span className="text-lg">👁️</span>
              Verify with World ID
            </button>
          )}
        </div>

        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            AgentPass
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-lg mx-auto leading-relaxed">
            An AI agent that checks your DeFi risk — verified human, paid per
            use, no API keys.
          </p>
        </div>

        <GlassCard className="w-full mb-8" glow={isVerified ? "purple" : "none"}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent-purple)] to-[var(--color-accent-teal)] flex items-center justify-center shadow-lg">
                🤖
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                  Your Agent
                </p>
                <button
                  type="button"
                  onClick={() => setIsAgentProfileOpen(true)}
                  className="text-sm font-medium gradient-text hover:opacity-80 transition-opacity flex items-center gap-1"
                >
                  {agentName} <span className="text-[10px]">↗</span>
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                Budget
              </p>
              <p className="text-sm font-medium text-[var(--color-text-primary)] mono">
                {isVerified ? "1.0 HBAR" : "Locked"}
              </p>
            </div>
          </div>

          <div className="relative group">
            <div
              className={`absolute -inset-1 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-teal)] ${!isVerified && "hidden"}`}
            />
            <div className="relative">
              {isVerified ? (
                <WalletInput />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(true)}
                  className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--color-border-glass)] rounded-xl py-4 px-6 text-center text-[var(--color-text-muted)] hover:border-[var(--color-border-accent)] transition-colors"
                >
                  Verify you&apos;re human to unlock the agent
                </button>
              )}
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-wrap justify-center gap-6 text-xs text-[var(--color-text-muted)] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-purple)]" />{" "}
            ENS Identity
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-teal)]" />{" "}
            The Graph Data
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-blue)]" />{" "}
            Hedera x402
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />{" "}
            World ID
          </div>
        </div>
      </div>

      <WorldVerifyModal
        open={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        ensName={agentName}
        onVerified={({ credential: cred }) => setCredential(cred)}
      />

      <AgentProfile
        isOpen={isAgentProfileOpen}
        onClose={() => setIsAgentProfileOpen(false)}
      />
    </main>
  );
}
