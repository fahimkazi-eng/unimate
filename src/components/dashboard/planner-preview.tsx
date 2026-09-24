import Link from "next/link";
import { ArrowUpRight, CalendarRange } from "lucide-react";
import type { PlannedDay } from "@/lib/planner";

/**
 * V3 Phase B §12 — Smart Planner preview.
 * A read-only slice of the advisory plan: the user's real open tasks spread
 * over the next 7 days. It never writes anything — planning is confirmed on
 * the full Planner page, per spec 37 (no silent calendar scheduling).
 */

interface PlannerPreviewProps {
  days: PlannedDay[];
  plannedCount: number;
  plannedMinutes: number;
  overloadDays: number;
}

export function PlannerPreview({
  days,
  plannedCount,
  plannedMinutes,
  overloadDays,
}: PlannerPreviewProps) {
  const maxMinutes = Math.max(1, ...days.map((d) => d.minutes));

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Smart planner</p>
        <Link
          href="/dashboard/planner"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Build my study plan
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {plannedCount === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
            <CalendarRange className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-foreground">
            Your week has room to breathe
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            No open tasks to plan. Add one and UniMate will spread your week.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-3 text-xs text-muted-foreground">
            {plannedCount} task{plannedCount === 1 ? "" : "s"} planned ·{" "}
            {Math.round(plannedMinutes / 60)}h{" "}
            {plannedMinutes % 60 > 0 ? `${plannedMinutes % 60}m ` : ""}over 7 days
            {overloadDays > 0
              ? ` · ${overloadDays} day${overloadDays === 1 ? "" : "s"} over budget`
              : ""}
          </p>

          <div className="mt-4 grid flex-1 grid-cols-7 gap-2">
            {days.map((day) => {
              const height =
                day.minutes > 0 ? Math.max(8, (day.minutes / maxMinutes) * 100) : 4;
              const label = new Intl.DateTimeFormat("en", {
                weekday: "short",
              }).format(new Date(`${day.key}T12:00:00`));
              return (
                <div
                  key={day.key}
                  className="flex flex-col items-center gap-1.5"
                  title={`${label} · ${day.minutes} min`}
                >
                  <div className="flex h-20 w-full items-end justify-center rounded-lg bg-muted/60">
                    <div
                      className={`w-full rounded-lg transition-[height] duration-500 ease-out-quart ${
                        day.overload
                          ? "bg-warning"
                          : day.minutes > 0
                            ? "bg-primary"
                            : "bg-transparent"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}