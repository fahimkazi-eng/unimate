"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion";

const MOVES = [
  { title: "Finish EER diagram", course: "Database Systems", due: "Due tomorrow" },
  { title: "Problem set 4", course: "Linear Algebra", due: "Due in 4 days" },
  { title: "Script for presentation", course: "Comms", due: "Due in 6 days" },
];

/** Dashboard demo — "Your next move" cycling through example tasks. */
export function DemoDashboard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % MOVES.length), 3000);
    return () => clearInterval(id);
  }, []);

  const move = MOVES[index];

  return (
    <div className="w-full">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
        Your next move
      </p>
      <p
        key={index}
        className="mt-1 animate-rise-in text-sm font-semibold text-foreground"
      >
        {move.title}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          {move.due}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
          <Play className="h-2.5 w-2.5" />
          Focus
        </span>
      </div>
    </div>
  );
}