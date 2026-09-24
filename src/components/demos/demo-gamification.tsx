"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

const XP_TARGET = 48;

/** Gamification demo — XP accrues, then a level-up chip pulses and resets. */
export function DemoGamification() {
  const [xp, setXp] = useState(0);
  const leveled = xp >= XP_TARGET;

  // XP counts up towards the target.
  useEffect(() => {
    if (prefersReducedMotion()) {
      const raf = requestAnimationFrame(() => setXp(XP_TARGET));
      return () => cancelAnimationFrame(raf);
    }
    const id = setInterval(() => {
      setXp((v) => (v >= XP_TARGET ? v : v + 4));
    }, 90);
    return () => clearInterval(id);
  }, []);

  // Hold the "Level 8!" pulse briefly, then restart the cycle.
  useEffect(() => {
    if (!leveled) return;
    const id = setTimeout(() => setXp(0), 1100);
    return () => clearTimeout(id);
  }, [leveled]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
          <Flame className="h-3 w-3" />
          12-day streak
        </span>
        <span
          key={leveled ? "level-up" : "level"}
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
            leveled
              ? "animate-scale-in bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {leveled ? "Level 8! ✨" : "Level 7"}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-100"
          style={{ width: `${(xp / XP_TARGET) * 100}%` }}
        />
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        +{xp} XP toward next level
      </p>
    </div>
  );
}