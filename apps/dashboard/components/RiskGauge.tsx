"use client";

import React, { useEffect, useState } from "react";
import { riskColor, riskLabel } from "@/lib/mock-data";

interface RiskGaugeProps {
  score: number;
  size?: number;
  animate?: boolean;
}

export default function RiskGauge({
  score,
  size = 200,
  animate = true,
}: RiskGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const [mounted, setMounted] = useState(false);

  // Animate the score counting up
  useEffect(() => {
    setMounted(true);
    if (!animate) {
      setDisplayScore(score);
      return;
    }

    let start = 0;
    const duration = 1500;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Eased progress (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * score);
      setDisplayScore(start);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [score, animate]);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;
  const strokeDashoffset = circumference - progress;

  const color = riskColor(displayScore);
  const label = riskLabel(displayScore);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          className="transform -rotate-90"
          style={{ width: size, height: size }}
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Progress circle */}
          {mounted && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-100 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${color})`,
              }}
            />
          )}
        </svg>

        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold tabular-nums"
            style={{ color, fontFamily: "var(--font-sans)" }}
          >
            {displayScore}
          </span>
          <span className="text-xs text-[var(--color-text-muted)] mt-1">
            / 100
          </span>
        </div>
      </div>

      {/* Label */}
      <div
        className="text-sm font-semibold px-4 py-1.5 rounded-full border"
        style={{
          color,
          borderColor: `${color}33`,
          backgroundColor: `${color}0d`,
        }}
      >
        {label}
      </div>
    </div>
  );
}
