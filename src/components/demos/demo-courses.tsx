"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

/** Example course colors shown on the homepage (demo data, like hero cards). */
const COURSES = [
  { name: "Database Systems", code: "CSE 203", color: "#4f46e5" },
  { name: "Linear Algebra", code: "MTH 141", color: "#7c3aed" },
  { name: "Technical Writing", code: "ENG 210", color: "#0d9488" },
];

/** Courses demo — the course color system, cycling today's active course. */
export function DemoCourses() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setActive((a) => (a + 1) % COURSES.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full space-y-1.5">
      {COURSES.map((course, index) => (
        <div
          key={course.name}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors duration-300",
            index === active
              ? "border-primary/40 bg-surface text-foreground"
              : "border-border bg-background text-muted-foreground"
          )}
        >
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: course.color }}
          />
          <span className="truncate">{course.name}</span>
          <span className="ml-auto text-[9px] uppercase tracking-wide text-muted-foreground">
            {course.code}
          </span>
        </div>
      ))}
    </div>
  );
}