"use client";

import React, { useState, useEffect, useCallback } from "react";
import { type ActivityStep } from "@/lib/mock-data";

interface ActivityLogProps {
  steps: ActivityStep[];
  onComplete: () => void;
  walletAddress: string;
}

const STEP_ICONS: Record<ActivityStep["icon"], { active: string; done: string }> = {
  graph: { active: "📡", done: "✅" },
  compute: { active: "🧮", done: "✅" },
  pay: { active: "💳", done: "✅" },
  budget: { active: "💰", done: "✅" },
  confirm: { active: "⏳", done: "✅" },
  complete: { active: "🔄", done: "✅" },
};

export default function ActivityLog({
  steps,
  onComplete,
  walletAddress,
}: ActivityLogProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);

  const runSteps = useCallback(async () => {
    setIsRunning(true);
    setCurrentStep(-1);
    setCompletedSteps(new Set());

    // Initial delay before starting
    await new Promise((r) => setTimeout(r, 600));

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);

      // Wait for the step's simulated duration
      await new Promise((r) => setTimeout(r, steps[i].duration));

      setCompletedSteps((prev) => {
        const next = new Set(prev);
        next.add(steps[i].id);
        return next;
      });
    }

    setIsRunning(false);

    // Brief pause then callback
    await new Promise((r) => setTimeout(r, 800));
    onComplete();
  }, [steps, onComplete]);

  useEffect(() => {
    runSteps();
  }, [runSteps]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? "bg-[var(--color-accent-purple)] pulse-glow" : "bg-[var(--color-success)]"}`} />
        <span className="text-sm text-[var(--color-text-secondary)]">
          {isRunning ? "Agent is working..." : "Analysis complete"}
        </span>
        <span className="ml-auto text-xs mono text-[var(--color-text-muted)]">
          Target: {walletAddress.slice(0, 10)}...
        </span>
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {steps.map((step, index) => {
          const isActive = currentStep === index && !completedSteps.has(step.id);
          const isDone = completedSteps.has(step.id);
          const isVisible = index <= currentStep;

          if (!isVisible) return null;

          return (
            <div
              key={step.id}
              className={`
                step-enter flex items-start gap-3 py-3 px-4 rounded-xl
                transition-all duration-300
                ${isActive ? "bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.2)]" : ""}
                ${isDone ? "bg-transparent" : ""}
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Status indicator */}
              <div className="mt-0.5 flex-shrink-0">
                {isActive ? (
                  <div className="spinner" />
                ) : isDone ? (
                  <span className="checkmark-pop inline-block text-lg">
                    {STEP_ICONS[step.icon].done}
                  </span>
                ) : null}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? "text-[var(--color-text-primary)]"
                      : isDone
                      ? "text-[var(--color-text-secondary)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {step.label}
                  {isActive && (
                    <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                      ...
                    </span>
                  )}
                  {isDone && (
                    <span className="ml-2 text-xs text-[var(--color-success)]">
                      done
                    </span>
                  )}
                </div>
                {step.detail && (
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5 mono">
                    {step.detail}
                  </div>
                )}
              </div>

              {/* Timing */}
              {isDone && (
                <span className="text-xs text-[var(--color-text-muted)] mono flex-shrink-0">
                  {(step.duration / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-4 relative h-1 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-teal)] transition-all duration-700 ease-out"
          style={{
            width: `${((completedSteps.size) / steps.length) * 100}%`,
          }}
        />
        {isRunning && (
          <div className="absolute inset-0 shimmer" />
        )}
      </div>
    </div>
  );
}
