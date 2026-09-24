"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

const DAYS = [
  { label: "Mon", date: 22 },
  { label: "Tue", date: 23 },
  { label: "Wed", date: 24 },
  { label: "Thu", date: 25 },
  { label: "Fri", date: 26 },
  { label: "Sat", date: 27 },
  { label: "Sun", date: 28 },
];

const AGENDA = [
  { day: "Mon", note: "DB assignment due" },
  { day: "Wed", note: "Algebra problem set" },
  { day: "Fri", note: "Presentation draft" },
];

/** Calendar 2.0 demo — a week strip with the active day + agenda cycling. */
export function DemoCalendar() {
  const [active, setActive] = useState(1);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setActive((a) => (a + 1) % DAYS.length), 2200);
    return () => clearInterval(id);
  }, []);

  const today = DAYS[active];
  const agenda = AGENDA.find((a) => a.day === today.label);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
          September
        </p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          Week view
        </span>
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-1">
        {DAYS.map((day, index) => (
          <div
            key={day.label}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-md border px-0.5 py-1 transition-colors duration-300",
              index === active
                ? "border-primary/50 bg-primary-soft text-foreground"
                : "border-border bg-background text-muted-foreground"
            )}
          >
            <span className="text-[8px] uppercase tracking-wide">{day.label}</span>
            <span className="text-[11px] font-semibold">{day.date}</span>
          </div>
        ))}
      </div>

      <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
        <span
          key={active}
          className="inline animate-fade-in-fast font-medium text-foreground"
        >
          {today.label}: {agenda?.note ?? "Nothing scheduled"}
        </span>
      </p>
    </div>
  );
}