import type { StudyDay } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface WeeklyChartProps {
  days: StudyDay[];
}

/** Pure-CSS bar chart of focus minutes for the last 7 days. */
export function WeeklyChart({ days }: WeeklyChartProps) {
  const max = Math.max(...days.map((d) => d.minutes), 1);

  return (
    <div className="flex h-44 items-end gap-2">
      {days.map((day) => {
        const pct = Math.round((day.minutes / max) * 100);
        return (
          <div
            key={day.date}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1"
          >
            <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
              {day.minutes > 0 ? day.minutes : ""}
            </span>
            <div className="relative h-28 w-full overflow-hidden rounded-md bg-muted">
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 rounded-md",
                  day.isToday ? "bg-primary" : "bg-primary/40"
                )}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span
              className={cn(
                "text-[11px]",
                day.isToday
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {day.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}