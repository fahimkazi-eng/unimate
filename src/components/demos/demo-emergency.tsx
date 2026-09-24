"use client";

import { useEffect, useState } from "react";
import { AlarmClock, CircleCheck, Siren } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

const CRISES = [
  { label: "Overdue by 2 days", title: "EER diagram", tone: "danger" },
  { label: "Due today · 5:00 PM", title: "Algebra problem set", tone: "warning" },
  { label: "Due in ~47 hours", title: "Presentation draft", tone: "default" },
];

/**
 * Emergency mode demo — cycles the crisis headline + "what can wait" state.
 * The real page computes this from the user's actual tasks (advisory only).
 */
export function DemoEmergency() {
  const [index, setIndex] = useState(0);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const raf = requestAnimationFrame(() => {
        setIndex(0);
        setCalm(true);
      });
      return () => cancelAnimationFrame(raf);
    }
    const id = setInterval(() => setIndex((i) => (i + 1) % CRISES.length), 2600);
    return () => clearInterval(id);
  }, []);

  // Occasionally show the calm "nothing urgent" state.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setCalm((c) => !c), 16000);
    return () => clearInterval(id);
  }, []);

  const crisis = CRISES[index];

  if (calm) {
    return (
      <div className="w-full">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-success">
          <CircleCheck className="mr-1 inline h-3 w-3" />
          All clear
        </p>
        <p className="mt-1 text-[11px] font-medium text-foreground">
          Nothing&apos;s on fire right now.
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          ~4h of open work · 2 due this week
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5">
        <Siren className="h-3.5 w-3.5 text-danger" />
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
            crisis.tone === "danger" && "bg-danger/10 text-danger",
            crisis.tone === "warning" && "bg-warning/10 text-warning",
            crisis.tone === "default" && "bg-muted text-foreground"
          )}
        >
          {crisis.label}
        </span>
      </div>
      <p
        key={index}
        className="mt-1.5 animate-fade-in-fast text-[12px] font-semibold text-foreground"
      >
        {crisis.title}
      </p>
      <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
        <AlarmClock className="h-3 w-3" />
        Start a 25-min focus session, then re-check.
      </p>
    </div>
  );
}