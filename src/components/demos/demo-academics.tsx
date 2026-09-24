"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

const GRADES = [
  { course: "Database Systems", letter: "A", credits: 3 },
  { course: "Linear Algebra", letter: "B+", credits: 4 },
  { course: "Technical Writing", letter: "A-", credits: 3 },
];

/** Academics demo — GPA math over example grades (real page uses user data). */
export function DemoAcademics() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setActive((a) => (a + 1) % GRADES.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
          <GraduationCap className="h-3 w-3" />
          Gradebook
        </p>
        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
          3.62 GPA
        </span>
      </div>

      <div className="mt-2 space-y-1.5">
        {GRADES.map((grade, index) => (
          <div
            key={grade.course}
            className={cn(
              "flex items-center justify-between gap-2 rounded-md border px-2 py-1 transition-colors duration-300",
              index === active
                ? "border-primary/40 bg-surface text-foreground"
                : "border-border bg-background text-muted-foreground"
            )}
          >
            <span className="truncate text-[10px] font-medium">{grade.course}</span>
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold text-foreground">
              {grade.letter}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}