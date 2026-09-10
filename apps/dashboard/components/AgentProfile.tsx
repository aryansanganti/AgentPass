"use client";

import React, { useState, useEffect } from "react";

interface AgentProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AgentIdentity {
  name: string;
  parentName: string;
  childName: string;
  capabilities: string[];
  endpoint: string;
  humanOwner: string;
  reputation: number;
}

export default function AgentProfile({ isOpen, onClose }: AgentProfileProps) {
  const [activeTab, setActiveTab] = useState<"identity" | "roles" | "records">("identity");
  const [agent, setAgent] = useState<AgentIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && !agent) {
      setLoading(true);
      fetch("/api/agent")
        .then((res) => res.json())
        .then((data) => {
          setAgent(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load agent identity", err);
          setLoading(false);
        });
    }
  }, [isOpen, agent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg step-enter">
        <div className="glass-card p-8 shadow-[0_0_40px_rgba(139,92,246,0.12)] border-[var(--color-border-accent)]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors text-xl"
          >
            ✕
          </button>

          {loading || !agent ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="spinner mb-4" />
              <p className="text-sm text-[var(--color-text-muted)]">Loading Identity from Sepolia...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent-purple)] to-[var(--color-accent-teal)] flex items-center justify-center text-2xl shadow-lg">
                  🤖
                </div>
                <div>
                  <h2 className="text-xl font-bold gradient-text">
                    {agent.name}
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mono">
                    ENSv2 · Sepolia Testnet
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[rgba(255,255,255,0.03)]">
                {(["identity", "roles", "records"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all duration-200 capitalize
                      ${
                        activeTab === tab
                          ? "bg-[var(--color-accent-purple)] text-white shadow-md"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                      }
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "identity" && (
                <div className="space-y-4 step-enter">
                  <InfoRow label="Agent Name" value={agent.name} mono />
                  <InfoRow label="Parent" value={agent.parentName} mono />
                  <InfoRow label="Child (24h expiry)" value={agent.childName} mono />
                  <InfoRow
                    label="Reputation"
                    value={`${agent.reputation} successful checks`}
                  />
                  <InfoRow
                    label="Capabilities"
                    value={agent.capabilities.join(", ")}
                  />
                </div>
              )}

              {activeTab === "roles" && (
                <div className="space-y-3 step-enter">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">Roles are enforced via Enhanced Access Control on Sepolia.</p>
                  
                  <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-accent-purple)]" />
                      <span className="text-sm font-medium capitalize">Human Owner</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mono mb-1">
                      {agent.humanOwner}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Full control — all records, role management</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-accent-teal)]" />
                      <span className="text-sm font-medium capitalize">Agent (Operator)</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mono mb-1">
                      0x1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0C
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Can write: agent.reputation, agent.last-active</p>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)]" />
                      <span className="text-sm font-medium capitalize">Sub-agent (Delegate)</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mono mb-1">
                      0x9f8E7d6C5b4A3f2E1d0C9b8A7f6E5d4C3b2A1f0E
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Read-only — no write access</p>
                  </div>
                </div>
              )}

              {activeTab === "records" && (
                <div className="space-y-4 step-enter">
                  <InfoRow label="agent.capabilities" value={JSON.stringify(agent.capabilities)} mono />
                  <InfoRow label="agent.endpoint" value={agent.endpoint} mono />
                  <InfoRow label="agent.human-owner" value={agent.humanOwner} mono />
                  <InfoRow label="agent.reputation" value={String(agent.reputation)} mono />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`text-sm text-[var(--color-text-primary)] ${
          mono ? "mono" : ""
        } break-all`}
      >
        {value}
      </span>
    </div>
  );
}
