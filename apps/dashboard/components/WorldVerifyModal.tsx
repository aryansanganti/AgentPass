"use client";

import React, { useCallback, useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";

const SESSION_KEY = "agentpass:world-session";
const CRED_KEY = "agentpass:world-credential";

/** Client-safe mirror of WorldCredential (avoid bundling Node crypto/fs). */
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

type PublicConfig = {
  configured: boolean;
  allowSandboxDemo: boolean;
  appId: string;
  rpId: string;
  action: string;
  environment: "staging" | "production";
  worldEnv: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onVerified: (result: WorldVerifyResult) => void;
  ensName?: string;
};

export default function WorldVerifyModal({
  open,
  onClose,
  onVerified,
  ensName,
}: Props) {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [idkitReady, setIdkitReady] = useState(false);
  const [IdKitWidget, setIdKitWidget] = useState<React.ComponentType<{
    open: boolean;
    onOpenChange: (o: boolean) => void;
    app_id: `app_${string}`;
    action: string;
    rp_context: {
      rp_id: string;
      nonce: string;
      created_at: number;
      expires_at: number;
      signature: string;
    };
    allow_legacy_proofs: boolean;
    environment: "staging" | "production";
    preset: unknown;
    handleVerify: (result: unknown) => Promise<void>;
    onSuccess: (result: unknown) => void;
    onError?: (err: unknown) => void;
  }> | null>(null);
  const [orbLegacy, setOrbLegacy] = useState<((opts: { signal: string }) => unknown) | null>(null);
  const [rpContext, setRpContext] = useState<{
    rp_id: string;
    nonce: string;
    created_at: number;
    expires_at: number;
    signature: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setStatus("idle");
    setError(null);
    fetch("/api/world/config")
      .then((r) => r.json())
      .then((c: PublicConfig) => setConfig(c))
      .catch((e) => setError(e instanceof Error ? e.message : "Config failed"));
  }, [open]);

  useEffect(() => {
    if (!open || !config?.configured) return;
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("@worldcoin/idkit");
        if (cancelled) return;
        setIdKitWidget(() => mod.IDKitRequestWidget as never);
        setOrbLegacy(() => mod.orbLegacy as never);
        const sigRes = await fetch("/api/world/rp-signature", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: config.action }),
        });
        if (!sigRes.ok) {
          const err = await sigRes.json().catch(() => ({}));
          throw new Error(err.error || "RP signature failed");
        }
        const sig = await sigRes.json();
        if (cancelled) return;
        setRpContext({
          rp_id: sig.rp_id,
          nonce: sig.nonce,
          created_at: sig.created_at,
          expires_at: sig.expires_at,
          signature: sig.sig,
        });
        setIdkitReady(true);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "IDKit unavailable — use sandbox demo"
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, config]);

  const finishWithServer = useCallback(
    async (opts: { idkitResponse?: unknown; forceSandboxDemo?: boolean }) => {
      setStatus("working");
      setError(null);
      const res = await fetch("/api/world/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...opts,
          ensName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Verification failed");
      }
      const sessionId = data.sessionId as string;
      sessionStorage.setItem(SESSION_KEY, sessionId);
      sessionStorage.setItem(CRED_KEY, JSON.stringify(data.credential));
      onVerified({ credential: data.credential, sessionId });
      onClose();
    },
    [ensName, onClose, onVerified]
  );

  const handleSandboxDemo = async () => {
    try {
      await finishWithServer({ forceSandboxDemo: true });
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Sandbox verify failed");
    }
  };

  if (!open) return null;

  const showIdKit =
    config?.configured && idkitReady && IdKitWidget && orbLegacy && rpContext;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <GlassCard padding="lg" className="w-full max-w-md text-center step-enter relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm"
        >
          Close
        </button>

        <div className="text-5xl mb-4 float">👁️</div>
        <h3 className="text-xl font-bold mb-2">Verify you&apos;re human</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Before your agent can spend HBAR or write ENS records, prove
          personhood with World ID (PRD Step 2).
        </p>

        {error && (
          <p className="text-sm text-[var(--color-risk-danger)] mb-4">{error}</p>
        )}

        {status === "working" && (
          <div className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[var(--color-text-primary)] w-1/2 animate-[shimmer_1s_infinite]" />
          </div>
        )}

        {showIdKit ? (
          <IdKitWidget
            open={open}
            onOpenChange={(o) => {
              if (!o) onClose();
            }}
            app_id={config.appId as `app_${string}`}
            action={config.action}
            rp_context={rpContext}
            allow_legacy_proofs={true}
            environment={config.environment}
            preset={orbLegacy({ signal: ensName || "agentpass" })}
            handleVerify={async (result) => {
              await finishWithServer({ idkitResponse: result });
            }}
            onSuccess={() => {
              /* state updated in handleVerify */
            }}
            onError={(err) => {
              setStatus("error");
              setError(
                err instanceof Error ? err.message : "World ID verification error"
              );
            }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {!config && (
              <p className="text-xs text-[var(--color-text-muted)]">
                Loading World config…
              </p>
            )}
            {config && !config.configured && (
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                Portal keys not set — using labeled{" "}
                <span className="mono">sandbox-demo</span> credential for the
                hackathon flow.
              </p>
            )}
            <button
              type="button"
              disabled={status === "working" || config?.allowSandboxDemo === false}
              onClick={handleSandboxDemo}
              className="w-full py-3 rounded-xl bg-[var(--color-text-primary)] text-black font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {status === "working"
                ? "Verifying…"
                : "Continue with World ID Sandbox"}
            </button>
          </div>
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
