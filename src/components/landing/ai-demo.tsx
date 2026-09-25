"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * V3 Phase F — interactive Study Coach demo on the public homepage.
 *
 * Honest by design: this is a SCRIPTED sample conversation in a mock
 * "Fahim" persona (rule 10 — the dashboard never uses this name). The
 * replies are pre-written example answers so a visitor can feel the
 * interaction before signing up; there is no live AI call, no typing
 * timer, no fake latency — tap a question, get the deterministic reply.
 * Motion is transform/opacity only and `prefers-reduced-motion` collapses
 * it globally.
 */

interface Exchange {
  question: string;
  answer: string;
}

const EXCHANGES: Exchange[] = [
  {
    question: "Where should I start today?",
    answer:
      "Database Systems is due tomorrow — start with the EER diagram, about 45 minutes. Nothing else is urgent today.",
  },
  {
    question: "Am I on pace this week?",
    answer:
      "You've logged 2h 10m across 3 sessions this week. You need about 6h total by Friday — the plan keeps you on track.",
  },
  {
    question: "What can wait?",
    answer:
      "Linear Algebra isn't due for 4 days, so the problem set can wait. Focus on Database Systems first.",
  },
  {
    question: "Plan my next 3 sessions",
    answer:
      "Tonight: EER diagram (45m). Tomorrow: Linear Algebra problem set (60m). Friday: review + a 25m focus burst.",
  },
];

export function AiDemo() {
  const [picked, setPicked] = useState<number | null>(null);
  const reply = picked === null ? null : EXCHANGES[picked];

  return (
    <section id="coach-demo" className="scroll-mt-16 border-t border-border bg-surface py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Copy */}
          <div>
            <Badge variant="outline">
              <Sparkles className="h-3 w-3" />
              Study Coach
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
              Ask your coach anything.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              UniMate&apos;s Study Coach turns your real tasks, courses and
              focus time into plain-language answers — what to do first,
              how your week is pacing, and what can wait.
            </p>

            <ul className="mt-6 space-y-2.5 text-sm leading-6 text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                />
                Answers grounded in your actual data — never made-up numbers.
              </li>
              <li className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                />
                Honest when it&apos;s offline: no key, no pretend intelligence.
              </li>
              <li className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                />
                Plans with you — it advises, it never silently moves deadlines.
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg" href="/signup">
                Try it with your own data
              </Button>
              <p className="text-xs text-muted-foreground">
                Free · setup takes under a minute
              </p>
            </div>
          </div>

          {/* Interactive demo */}
          <div className="rounded-2xl border border-border bg-background p-4 shadow-lg shadow-glow-accent sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Study Coach</p>
                  <p className="text-xs text-muted-foreground">Scripted demo · sample student</p>
                </div>
              </div>
              <Badge variant="outline">Not live AI</Badge>
            </div>

            {/* Conversation */}
            <div className="mt-4 space-y-3">
              <div className="flex items-end gap-1.5">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Sparkles className="h-3 w-3" aria-hidden />
                </span>
                <p className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-secondary px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
                  Hi Fahim! Database Systems is due tomorrow and Linear
                  Algebra lands in 4 days. What would you like to sort out
                  first?
                </p>
              </div>

              {reply ? (
                <>
                  <div className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground animate-fade-in-fast">
                      {reply.question}
                    </p>
                  </div>
                  <div className="flex items-end gap-1.5">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Sparkles className="h-3 w-3" aria-hidden />
                    </span>
                    <p
                      key={picked}
                      className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-secondary px-3.5 py-2.5 text-sm leading-relaxed text-foreground animate-fade-in-fast"
                    >
                      {reply.answer}
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            {/* Suggestion chips — real buttons, full-width tappable area */}
            <div className="mt-4 flex flex-wrap gap-2">
              {EXCHANGES.map((exchange, i) => (
                <button
                  key={exchange.question}
                  type="button"
                  onClick={() => setPicked(i)}
                  aria-pressed={picked === i}
                  className={cn(
                    "min-h-[44px] rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
                    picked === i
                      ? "border-primary bg-primary-soft text-foreground"
                      : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-muted"
                  )}
                >
                  {exchange.question}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Sample conversation with pre-written answers — tap a question
              to step through it. Your coach after sign-in answers from your
              own tasks and courses.
            </p>

            {/* Phones: the conversation ends with one clear next step. */}
            <Button href="/signup" className="mt-4 w-full sm:hidden">
              Start your plan
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}