"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { WalletIcon } from "@/components/Icons";

export default function WalletInput() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      router.push(
        `/check?address=${encodeURIComponent("0x7a3f8E2d1C9b4A5e6F0d7B8c9E1a2D3f4C5b6A7c")}`
      );
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
        <div className="absolute left-4 text-[var(--color-text-muted)]">
          <WalletIcon className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (error) setError("");
          }}
          placeholder="0x7a3f8E2d1C9b4A5e6F0d7B8c9E1a2D3f4C5b6A7c"
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
