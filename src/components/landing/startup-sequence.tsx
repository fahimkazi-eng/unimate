"use client";

import { useLayoutEffect, useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Cinematic startup entrance for the public homepage (visual overhaul §9–10).
 *
 * - Plays once per BROWSER (localStorage flag), never on reloads or repeat
 *   visits — mobile users who open the site daily see the veil exactly once,
 *   so it never reads as a slow loader.
 * - Skipped entirely under `prefers-reduced-motion` (functionality first).
 * - Pure opacity/transform motion; the overlay is pointer-events-none from
 *   the start, so the page underneath stays fully interactive — the
 *   sequence never blocks the app.
 * - Timing: glow ~0ms → logo ~150ms → light pass ~250ms → wordmark ~350ms →
 *   the whole veil dissolves ~0.75s → gone by ~1.15s. Kept snappy so the
 *   first visit still exposes content in about a second.
 *
 * Hydration-safe: the first render is ALWAYS the visible veil on both the
 * server and the client (no `window` reads during render), so HTML matches.
 * Repeat visitors / reduced-motion users are hidden in a layout effect via
 * a microtask — which flushes BEFORE the first paint, so they never see a
 * flash of the veil.
 */

const STORAGE_KEY = "unimate:intro-seen";

type Phase = "playing" | "leaving" | "done";

export function StartupSequence() {
  const [phase, setPhase] = useState<Phase>("playing");

  useLayoutEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* storage unavailable — play anyway */
    }

    if (alreadySeen || prefersReducedMotion()) {
      // Pre-paint hide for repeat / reduced-motion visitors.
      queueMicrotask(() => setPhase("done"));
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable — play anyway */
    }

    const leave = setTimeout(() => setPhase("leaving"), 750);
    const done = setTimeout(() => setPhase("done"), 1150);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[80] flex items-center justify-center overflow-hidden",
        "bg-background transition-opacity duration-500 ease-out",
        phase === "leaving" && "opacity-0"
      )}
    >
      {/* Ambient glow that greets first */}
      <div
        className="absolute inset-0 animate-aurora"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 50%, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent 70%)",
        }}
      />

      {/* Logo block */}
      <div
        className={cn(
          "flex flex-col items-center gap-4 transition-transform duration-500 ease-out",
          phase === "leaving" && "scale-110"
        )}
      >
        <div
          className="relative animate-scale-in"
          style={{ animationDelay: "150ms" }}
        >
          <div className="absolute -inset-3 animate-pulse-soft rounded-2xl bg-primary/25 blur-xl" />
          <div className="relative overflow-hidden rounded-2xl shadow-glow-primary">
            <BrandMark className="h-16 w-16 rounded-2xl" />
            {/* Light pass across the logo */}
            <div
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              style={{ animation: "sheen 1.1s 150ms var(--ease-out-expo) both" }}
            />
          </div>
        </div>

        <p
          className="animate-rise-in text-2xl font-bold tracking-tight text-gradient"
          style={{ animationDelay: "250ms" }}
        >
          UniMate
        </p>
        <p
          className="animate-rise-in text-xs uppercase tracking-[0.32em] text-muted-foreground"
          style={{ animationDelay: "350ms" }}
        >
          Your student operating system
        </p>
      </div>
    </div>
  );
}