"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

const TASKS = [
  { title: "Read chapter 6 notes", priority: "High", xp: 10 },
  { title: "Submit quiz 3", priority: "Medium", xp: 15 },
  { title: "Annotate readings", priority: "Low", xp: 5 },
];

/**
 * Tasks demo — rows auto-complete in a loop; the newest completion earns a
 * floating "+XP" chip and a check bubble fills in.
 */
export function DemoTasks() {
  const [done, setDone] = useState(1);
  const [ping, setPing] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const raf = requestAnimationFrame(() => setDone(TASKS.length));
      return () => cancelAnimationFrame(raf);
    }
    const id = setInterval(() => {
      setPing((p) => p + 1);
      setDone((d) => (d >= TASKS.length ? 1 : d + 1));
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full space-y-1.5">
      {TASKS.map((task, index) => {
        const isDone = index < done;
        return (
          <div
            key={task.title}
            className={cn(
              "flex items-center gap-2 rounded-md border px-2 py-1.5 transition-colors duration-300",
              isDone ? "border-border bg-muted/60" : "border-border bg-surface"
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                isDone
                  ? "border-success bg-success/15 text-success"
                  : "border-border text-transparent"
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span
              className={cn(
                "flex-1 truncate text-xs font-medium transition-opacity duration-300",
                isDone
                  ? "text-muted-foreground line-through opacity-70"
                  : "text-foreground"
              )}
            >
              {task.title}
            </span>
            {isDone && index === done - 1 ? (
              <span
                key={ping}
                className="animate-rise-in text-[10px] font-semibold text-success"
              >
                +{task.xp} XP
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">
                {task.priority}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}