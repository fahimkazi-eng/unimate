"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

const BARS = [42, 68, 24, 92, 55, 76, 30];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** Progress demo — the weekly activity chart growing bar by bar. */
export function DemoProgress() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setCount(BARS.length);
      return;
    }
    const id = setInterval(() => {
      setCount((c) => (c >= BARS.length ? 0 : c + 1));
    }, 280);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-16 w-full items-end gap-1.5">
      {BARS.map((height, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-1">
          <div className="relative h-12 w-full overflow-hidden rounded bg-muted">
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 rounded transition-[height] duration-300",
                index === 3 ? "bg-primary" : "bg-primary/40"
              )}
              style={{ height: `${index < count ? height : 0}%` }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground">{DAYS[index]}</span>
        </div>
      ))}
    </div>
  );
}