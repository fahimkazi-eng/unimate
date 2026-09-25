"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, GraduationCap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * UniMate AI live demo — visual overhaul §13–14.
 *
 * A realistic, scripted recovery-plan conversation on the public homepage:
 *   "I have a Data Structures exam in 5 days and I haven't started." → the
 *   coach builds a 5-day plan, rows reveal one by one, then a Start Plan
 *   CTA appears. Honest by design: it is a pre-written DEMO (no live AI
 *   call, nothing leaves the page, the "Fahim" persona never appears in the
 *   real dashboard). Under `prefers-reduced-motion` the whole exchange is
 *   revealed instantly with no timers.
 *
 * Motion is transform/opacity only; the moving gradient border + orbit ring
 * are single compositor elements.
 */

interface PlanDay {
  day: string;
  topic: string;
  tone: string;
}

const PLAN: PlanDay[] = [
  { day: "Day 1", topic: "Arrays + linked lists", tone: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  { day: "Day 2", topic: "Stacks + queues", tone: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { day: "Day 3", topic: "Trees", tone: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" },
  { day: "Day 4", topic: "Graphs + practice", tone: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  { day: "Day 5", topic: "Mock test + weak topics", tone: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
];

const STRENGTHS = ["Courses", "Tasks", "Calendar", "Notes", "Progress"];

/** Progress through the demo: 0 student → 1 typing → 2 reply → 3 plan → 4 done. */
type Stage = 0 | 1 | 2 | 3 | 4;

export function AiDemo() {
  const [stage, setStage] = useState<Stage>(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const t = setTimeout(() => setStage(4), 0);
      return () => clearTimeout(t);
    }
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1500),
      setTimeout(() => setStage(3), 2200),
      setTimeout(() => setStage(4), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section id="coach-demo" className="relative scroll-mt-20 overflow-hidden border-y border-border bg-background-secondary/60">
      {/* Section ambience — violet + cyan */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 hidden h-96 w-96 rounded-full opacity-70 lg:block"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 16%, transparent) 0%, transparent 68%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 hidden h-96 w-96 rounded-full opacity-70 lg:block"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, rgb(34 211 238 / 1) 14%, transparent) 0%, transparent 68%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
        {/* Left — the pitch */}
        <div>
          <Badge className="border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300">
            <Sparkles className="h-3 w-3" aria-hidden /> UniMate AI
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your personal study{" "}
            <span className="text-gradient">assistant</span>.
          </h2>
          <p className="mt-4 max-w-md text-lg leading-8 text-muted-foreground">
            Tell it what&apos;s on your plate — deadlines, courses, focus
            time — and it turns chaos into a day-by-day plan you can actually
            start.
          </p>

          {/* What the AI reads */}
          <div className="mt-8 flex max-w-md">
            <div className="relative">
              {/* Orb + slowly orbiting ring (transform-only element) */}
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div
                  aria-hidden
                  className="absolute inset-0 animate-orbit-slow rounded-full border border-dashed border-violet-400/40"
                />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand shadow-glow-primary">
                  <Sparkles className="h-5 w-5 text-white" aria-hidden />
                </div>
              </div>
              <div className="ml-5 flex flex-wrap items-center gap-2">
                {STRENGTHS.map((label, i) => (
                  <span
                    key={label}
                    className="animate-rise-in inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <Check className="h-3 w-3 text-success" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right — the live demo conversation */}
        <div className="gradient-ring relative rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-glow-accent sm:p-6">
          {/* Typing indicator + messages */}
          <div className="space-y-3">
            {/* Student bubble */}
            <div
              className="animate-rise-in ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary-soft px-4 py-3 text-sm text-foreground"
              style={{ animationDelay: "100ms" }}
            >
              I have a Data Structures exam in 5 days and I haven&apos;t
              started.
            </div>

            {/* Reply bubble */}
            {stage >= 1 && (
              <div className="flex max-w-[85%] items-start gap-2 animate-rise-in">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-brand">
                  <Sparkles className="h-3.5 w-3.5 text-white" aria-hidden />
                </span>
                <div className="rounded-2xl rounded-bl-sm border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground">
                  {stage === 1 ? (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      UniMate is thinking
                      <span className="flex gap-1" aria-hidden>
                        <span className="h-1 w-1 animate-typing-dot rounded-full bg-current" />
                        <span className="h-1 w-1 animate-typing-dot rounded-full bg-current [animation-delay:150ms]" />
                        <span className="h-1 w-1 animate-typing-dot rounded-full bg-current [animation-delay:300ms]" />
                      </span>
                    </span>
                  ) : (
                    <>
                      You&apos;re not too late. I built a{" "}
                      <span className="font-semibold text-primary">5-day recovery plan</span>.
                    </>
                  )}
                </div>
              </div>
            )}

            {/* The plan */}
            {stage >= 2 && (
              <ul className="space-y-1.5">
                {PLAN.map((row, i) => (
                  <li
                    key={row.day}
                    className={`animate-rise-in flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${row.tone}`}
                    style={{ animationDelay: `${240 + i * 140}ms` }}
                  >
                    <span className="text-xs font-bold uppercase tracking-wide">{row.day}</span>
                    <span className="text-sm font-medium">{row.topic}</span>
                  </li>
                ))}
              </ul>
            )}

            {stage >= 3 && (
              <div className="animate-rise-in pt-1" style={{ animationDelay: "100ms" }}>
                <Button href="/signup" size="md" className="w-full bg-gradient-brand shadow-glow-primary">
                  Start Plan
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden />
                  Scripted demo — no live AI call, nothing leaves this page.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}