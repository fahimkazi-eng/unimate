"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion";

const REPLIES = [
  {
    question: "Where should I start today?",
    answer:
      "Database Systems is due tomorrow — start with the EER diagram, ≈ 45 min.",
  },
  {
    question: "Am I on pace this week?",
    answer:
      "You logged 2h 10m across 3 sessions. This week needs ≈ 6h by Friday.",
  },
  {
    question: "What can wait?",
    answer: "Your undated goals can wait — focus on what's actually due first.",
  },
];

/**
 * Study Coach demo — a coach reply cycling through real-data answers.
 * Static copy only; the live page reads the user's own tasks.
 */
export function DemoCoach() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % REPLIES.length), 3400);
    return () => clearInterval(id);
  }, []);

  const reply = REPLIES[index];

  return (
    <div className="w-full space-y-2">
      <div className="flex items-end gap-1.5">
        <span className="rounded-lg rounded-bl-sm bg-muted px-2.5 py-1.5 text-[10px] text-muted-foreground">
          {reply.question}
        </span>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="h-2.5 w-2.5" />
        </span>
        <span
          key={index}
          className="rounded-lg rounded-tr-sm bg-primary/15 px-2.5 py-1.5 text-[10px] text-foreground animate-fade-in-fast"
        >
          {reply.answer}
        </span>
      </div>
    </div>
  );
}