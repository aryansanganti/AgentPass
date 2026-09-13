"use client";

import React, { useEffect, useState } from "react";
import { riskLabel } from "@/lib/mock-data";

// Must be raw hex — CSS variable strings break SVG stroke and inline filter
function riskHex(score: number): string {
  if (score <= 30) return "#22c55e";
  if (score <= 60) return "#f59e0b";
  return "#ef4444";
}

interface RiskGaugeProps {
  score: number;
  size?: number;
  animate?: boolean;
}

export default function RiskGauge({ score, size = 200, animate = true }: RiskGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!animate) { setDisplayScore(score); return; }

    const duration = 1500;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score, animate]);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const color = riskHex(displayScore);
  const label = riskLabel(displayScore);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          className="-rotate-90"
          style={{ width: size, height: size }}
        >
          {/* Track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          {mounted && (
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ filter: `drop-shadow(0 0 10px ${color})`, transition: "stroke-dashoffset 0.1s ease-out" }}
            />
          )}
        </svg>

        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-extrabold tabular-nums leading-none"
            style={{ color, fontSize: size * 0.2 }}
          >
            {displayScore}
          </span>
          <span className="text-xs text-[#94a3b8] mt-1">/ 100</span>
        </div>
      </div>

      {/* Risk label pill */}
      <div
        className="text-sm font-bold px-5 py-1.5 rounded-full border"
        style={{
          color,
          borderColor: `${color}55`,
          backgroundColor: `${color}12`,
          boxShadow: `0 0 16px ${color}22`,
        }}
      >
        {label}
      </div>
    </div>
  );
}
