"use client";

import React, { useCallback, useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";
import { WorldIcon } from "@/components/Icons";

const SESSION_KEY = "agentpass:world-session";
const CRED_KEY = "agentpass:world-credential";

export type WorldVerifyCredential = {
  verified: boolean;
  hash: string;
  nullifier?: string;
  method: string;
  timestamp: number;
  action: string;
  sessionId?: string;
};

export type WorldVerifyResult = {
  credential: WorldVerifyCredential;
  sessionId: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onVerified: (result: WorldVerifyResult) => void;
  ensName?: string;
};

const PHASES = [
  "Connecting to World ID…",
  "Requesting proof of personhood…",
  "Verifying unique human…",
  "Unlocking agent budget…",
];

export default function WorldVerifyModal({
  open,
  onClose,
  onVerified,
  ensName,
}: Props) {
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const runVerify = useCallback(async () => {
    setStatus("working");
    setError(null);
    setPhase(0);

    const timers = [
      window.setTimeout(() => setPhase(1), 700),
      window.setTimeout(() => setPhase(2), 1500),
      window.setTimeout(() => setPhase(3), 2300),
    ];

    try {
      const res = await fetch("/api/world/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          forceSandboxDemo: true,
          ensName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Verification failed");
      }
      await new Promise((r) => setTimeout(r, 2800));
      const sessionId = data.sessionId as string;
      sessionStorage.setItem(SESSION_KEY, sessionId);
      sessionStorage.setItem(CRED_KEY, JSON.stringify(data.credential));
      onVerified({ credential: data.credential, sessionId });
      onClose();
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "World ID verification failed");
    } finally {
      timers.forEach(clearTimeout);
    }
  }, [ensName, onClose, onVerified]);

  useEffect(() => {
    if (open) {
      setStatus("idle");
      setPhase(0);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <GlassCard padding="lg" className="w-full max-w-md text-center step-enter relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm"
        >
          Close
        </button>

        <div className="relative mx-auto mb-5 h-24 w-24">
          <div className="absolute inset-0 rounded-full border border-[rgba(139,92,246,0.35)] animate-ping opacity-40" />
          <div className="absolute inset-2 rounded-full border border-[rgba(45,212,191,0.5)]" />
          <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-primary)]">
            <WorldIcon className="h-8 w-8" />
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2">World ID</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Prove you&apos;re a unique human before the agent can spend HBAR or
          update ENS records.
        </p>

        {error && (
          <p className="text-sm text-[var(--color-risk-danger)] mb-4">{error}</p>
        )}

        {status === "working" && (
          <div className="mb-5 space-y-3">
            <p className="text-sm text-[var(--color-accent-teal)]">{PHASES[phase]}</p>
            <div className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-teal)] transition-all duration-700"
                style={{ width: `${25 * (phase + 1)}%` }}
              />
            </div>
          </div>
        )}

        {status !== "working" && (
          <button
            type="button"
            onClick={runVerify}
            className="w-full py-3 rounded-xl bg-[var(--color-text-primary)] text-black font-semibold hover:opacity-90 transition-opacity"
          >
            Verify with World ID
          </button>
        )}
      </GlassCard>
    </div>
  );
}

export function loadStoredWorldSession(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function loadStoredCredential(): WorldVerifyCredential | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CRED_KEY);
    return raw ? (JSON.parse(raw) as WorldVerifyCredential) : null;
  } catch {
    return null;
  }
}
