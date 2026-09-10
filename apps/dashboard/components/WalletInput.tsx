"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function WalletInput() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setError("Please enter a wallet address");
      return;
    }
    // Basic length check for demo
    if (address.length < 32) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    // Pass address via query param to keep it simple for the demo
    router.push(`/check?address=${encodeURIComponent(address)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-xl text-[var(--color-text-muted)]">
          👛
        </div>
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (error) setError("");
          }}
          placeholder="0x..."
          className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--color-border-glass)] rounded-xl py-4 pl-12 pr-36 text-[var(--color-text-primary)] mono focus:outline-none focus:border-[var(--color-accent-purple)] transition-colors shadow-inner placeholder:text-[var(--color-text-muted)]"
        />
        <div className="absolute right-2 top-2 bottom-2">
          <button
            type="submit"
            className="h-full px-6 bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-teal)] text-white font-medium rounded-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center gap-2"
          >
            Check Risk <span>→</span>
          </button>
        </div>
      </div>
      {error && (
        <div className="absolute -bottom-6 left-2 text-xs text-[var(--color-error)]">
          {error}
        </div>
      )}
    </form>
  );
}
