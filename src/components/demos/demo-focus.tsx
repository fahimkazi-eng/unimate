"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const RING_RADIUS = 22;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Focus demo — a mini pomodoro ring that fills, completes, and resets. */
export function DemoFocus() {
  const [progress, setProgress] = useState(0);
  const done = progress >= 100;

  // Ring fills towards 100% on a fast loop.
  useEffect(() => {
    if (prefersReducedMotion()) {
      const raf = requestAnimationFrame(() => setProgress(100));
      return () => cancelAnimationFrame(raf);
    }
    const id = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 2));
    }, 40);
    return () => clearInterval(id);
  }, []);

  // Brief "Complete" pause, then restart the cycle.
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setProgress(0), 1800);
    return () => clearTimeout(id);
  }, [done]);

  return (
    <div className="flex items-center gap-3">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        className="-rotate-90"
        role="img"
        aria-label="Focus timer demo"
      >
        <circle
          cx="32"
          cy="32"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="5"
        />
        <circle
          cx="32"
          cy="32"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
          className="transition-[stroke-dashoffset] duration-100 ease-linear"
        />
      </svg>
      <div>
        <p className="text-xs font-semibold text-foreground">25:00 focus</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {done ? "Session complete ✓" : "In session"}
        </p>
      </div>
    </div>
  );
}