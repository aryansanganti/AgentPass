"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "purple" | "teal" | "none";
  padding?: "sm" | "md" | "lg";
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
  glow = "none",
  padding = "md",
}: GlassCardProps) {
  const paddings = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const glowStyles = {
    purple: "shadow-[0_0_40px_rgba(139,92,246,0.12)]",
    teal: "shadow-[0_0_40px_rgba(45,212,191,0.1)]",
    none: "",
  };

  return (
    <div
      className={`
        glass-card
        ${paddings[padding]}
        ${glowStyles[glow]}
        ${hover ? "" : "hover:bg-[var(--color-bg-glass)] hover:border-[var(--color-border-glass)] hover:shadow-[var(--shadow-glass)]"}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
