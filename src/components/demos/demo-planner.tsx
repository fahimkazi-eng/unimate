"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

const PLAN = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 90 },
  { day: "Wed", minutes: 60 },
  { day: "Thu", minutes: 30 },
  { day: "Fri", minutes: 120 },
  { day: "Sat", minutes: 75 },
  { day: "Sun", minutes: 30 },
];

const MAX = Math.max(...PLAN.map((d) => d.minutes));
const TOTAL = PLAN.reduce((sum, d) => sum + d.minutes, 0);

/**
 * Smart planner demo — an advisory 7-day plan bar chart. The highlighted day
 * cycles; bars always reflect the *estimated* minutes (never fake guarantees).
 */
export function DemoPlanner() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setActive((a) => (a + 1) % PLAN.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
          This week&apos;s plan
        </p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          ~{Math.round(TOTAL / 60)}h · advisory
        </span>
      </div>

      <div className="mt-2 flex items-end gap-1">
        {PLAN.map((day, index) => (
          <div key={day.day} className="flex flex-1 flex-col items-center gap-0.5">
            <div
              className={cn(
                "w-full rounded-sm transition-colors duration-300",
                index === active ? "bg-primary" : "bg-primary/30"
              )}
              style={{ height: `${(day.minutes / MAX) * 44}px` }}
              title={`${day.day} · ${day.minutes} min`}
            />
            <span className="text-[8px] uppercase tracking-wide text-muted-foreground">
              {day.day[0]}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
        <span
          key={active}
          className="inline animate-fade-in-fast font-medium text-foreground"
        >
          {PLAN[active].day}: ≈ {PLAN[active].minutes} min
        </span>
      </p>
    </div>
  );
}