"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  ListChecks,
  Sparkles,
  Timer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Living UniMate preview — visual overhaul §12.
 *
 * A scripted loop that walks a visitor through the app's core flow inside
 * the hero card: task created → AI detects workload → plan created →
 * calendar updated → focus started → task completed (+25 XP) → progress
 * updated. It is a MARKETING DEMO with a fake "Fahim" persona (rule 10 —
 * the real dashboard never shows this name or these numbers).
 *
 * Performance: one interval, one state swap per step, transform/opacity
 * animations only. The progress bar derives its target from the current
 * step and lets the CSS transition animate the scaleX — no extra state,
 * no setState in effects. Under `prefers-reduced-motion` the loop freezes
 * on the first step and Global CSS collapses all transitions.
 */

interface Step {
  eyebrow: string;
  title: string;
  sub: string;
  chips: string[];
  icon: LucideIcon;
  progress: number;
}

const TONES = {
  violet: "border-violet-500/30 bg-violet-500/15 text-violet-300",
  fuchsia: "border-fuchsia-500/30 bg-fuchsia-500/15 text-fuchsia-300",
  sky: "border-sky-500/30 bg-sky-500/15 text-sky-300",
  cyan: "border-cyan-500/30 bg-cyan-500/15 text-cyan-300",
  emerald: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  amber: "border-amber-500/30 bg-amber-500/15 text-amber-300",
} as const;

const STEPS: Array<Step & { tones: Array<keyof typeof TONES> }> = [
  {
    eyebrow: "Task created",
    title: "Database Systems Assignment",
    sub: "Capture a deadline in one tap.",
    chips: ["Due tomorrow", "High priority", "~45 min"],
    tones: ["violet", "emerald", "amber"],
    icon: ListChecks,
    progress: 18,
  },
  {
    eyebrow: "UniMate AI detects workload",
    title: "3 deadlines this week",
    sub: "I can build you a recovery plan.",
    chips: ["AI suggestion"],
    tones: ["fuchsia"],
    icon: Sparkles,
    progress: 28,
  },
  {
    eyebrow: "Study plan created",
    title: "5-day plan ready",
    sub: "Day 1 · Arrays & linked lists.",
    chips: ["Start plan"],
    tones: ["sky"],
    icon: CalendarRange,
    progress: 42,
  },
  {
    eyebrow: "Calendar updated",
    title: "Study blocks added",
    sub: "Mon–Thu · 6:00 PM · 60 min.",
    chips: ["4 blocks"],
    tones: ["cyan"],
    icon: CalendarClock,
    progress: 56,
  },
  {
    eyebrow: "Focus started",
    title: "60:00 · Database Systems",
    sub: "Timer running · distractions blocked.",
    chips: ["In focus"],
    tones: ["emerald"],
    icon: Timer,
    progress: 68,
  },
  {
    eyebrow: "Task completed",
    title: "+25 XP · Nicely done",
    sub: "Assignment marked done.",
    chips: ["+25 XP"],
    tones: ["amber"],
    icon: CheckCircle2,
    progress: 84,
  },
  {
    eyebrow: "Progress updated",
    title: "Semester at 78%",
    sub: "On track across the week.",
    chips: ["On track"],
    tones: ["emerald"],
    icon: TrendingUp,
    progress: 100,
  },
];

export function HeroPreview() {
  const [index, setIndex] = useState(0);
  // Resolved in a lazy initializer (never a ref read during render).
  const [reduced] = useState(() =>
    typeof window !== "undefined" && prefersReducedMotion()
  );

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % STEPS.length), 2600);
    return () => clearInterval(id);
  }, [reduced]);

  const step = STEPS[index];
  const Icon = step.icon;

  return (
    <div
      key={index}
      className="rounded-xl border border-primary/30 bg-background-secondary p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
          {step.eyebrow}
        </p>
        <Icon className="h-4 w-4 text-primary" aria-hidden />
      </div>

      <p
        className="mt-1 animate-rise-in text-sm font-semibold text-foreground"
        style={{ animationDelay: "60ms" }}
      >
        {step.title}
      </p>
      <p
        className="mt-0.5 animate-rise-in text-xs text-muted-foreground"
        style={{ animationDelay: "120ms" }}
      >
        {step.sub}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {step.chips.map((chip, i) => (
          <span
            key={chip}
            className={`animate-rise-in inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${TONES[step.tones[i] ?? "violet"]}`}
            style={{ animationDelay: `${180 + i * 60}ms` }}
          >
            {chip}
          </span>
        ))}
      </div>

      {/* Progress fill — target comes from the step; the CSS transition
          animates the scaleX between steps (transform-only, compositor). */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>UniMate flow</span>
          <span className="font-semibold text-foreground">{step.progress}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full w-full origin-left rounded-full bg-gradient-brand"
            style={{
              transform: `scaleX(${step.progress / 100})`,
              transition: "transform 900ms var(--ease-out-quart)",
            }}
          />
        </div>
      </div>
    </div>
  );
}