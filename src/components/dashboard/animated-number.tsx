"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

interface AnimatedNumberProps {
  value: number;
  /** Smallest unit to snap to (0 = integers). */
  step?: number;
  /** Animation length in ms. */
  duration?: number;
  className?: string;
}

/**
 * Counts a number up from 0 once, on mount.
 * - Deferred rAF loop (never setState during render).
 * - `prefers-reduced-motion` skips the loop entirely and jumps to the final
 *   value via a single deferred rAF (same terminal-state pattern we use
 *   everywhere).
 * - Grabs the value only once, so fast re-renders can't re-trigger it.
 */
export function AnimatedNumber({
  value,
  step = 1,
  duration = 600,
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      rafRef.current = requestAnimationFrame(() => setDisplay(value));
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }

    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // ease-out cubic — fast start, gentle landing
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // Only animate once per mount, even if `value` changes later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = Math.round(display / step) * step;

  return (
    <span className={className}>
      {shown.toLocaleString(undefined, {
        maximumFractionDigits: 3,
      })}
    </span>
  );
}