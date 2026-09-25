import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskWithCourse } from "@/lib/database.types";

/**
 * V3 Phase B §11 — Calendar preview (NOT the full calendar).
 * Shows what the next few days actually hold from the user's dated tasks,
 * then hands off to the full Calendar page. Phones get a compact
 * "This week" day strip (real per-day counts, scrollable); sm+ keeps the
 * today/tomorrow rows.
 */

interface CalendarDay {
  key: string;
  label: string;
  date: number;
  count: number;
}

interface CalendarPreviewProps {
  /** Tasks due today, most urgent first. */
  today: TaskWithCourse[];
  /** Tasks due tomorrow. */
  tomorrow: TaskWithCourse[];
  /** Total dated tasks across the next 7 days (incl. today/tomorrow). */
  weekCount: number;
  /** Next 7 days, one cell each — real counts, never invented events. */
  week: CalendarDay[];
}

export function CalendarPreview({
  today,
  tomorrow,
  weekCount,
  week,
}: CalendarPreviewProps) {
  const rows = [
    { label: "Today", tasks: today },
    { label: "Tomorrow", tasks: tomorrow },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Calendar</p>
        <Link
          href="/dashboard/calendar"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Open calendar
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* This week — compact day strip on phones (preview only; the full
          calendar lives on its own page). */}
      <div
        aria-label="This week"
        className="mt-3 flex snap-x gap-1.5 overflow-x-auto pb-1 sm:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {week.map((day) => (
          <div
            key={day.key}
            className={cn(
              "flex min-w-[58px] snap-start flex-col items-center rounded-xl border px-2 py-2",
              day.count > 0
                ? "border-violet-500/40 bg-violet-500/10"
                : "border-border bg-surface"
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {day.label}
            </span>
            <span className="mt-0.5 text-base font-bold tabular-nums text-foreground">
              {day.date}
            </span>
            <span
              className={cn(
                "mt-1 min-h-4 whitespace-nowrap text-[10px] font-semibold",
                day.count > 0 ? "text-violet-400" : "text-muted-foreground/60"
              )}
            >
              {day.count > 0 ? `${day.count} task${day.count === 1 ? "" : "s"}` : "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 hidden flex-1 flex-col gap-3 sm:flex">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {row.label}
            </p>
            {row.tasks.length === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Nothing scheduled.
              </p>
            ) : (
              <ul className="mt-1.5 space-y-1.5">
                {row.tasks.slice(0, 2).map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <span
                      aria-hidden
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        background: task.course?.color ?? "var(--color-primary)",
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {task.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {task.course?.name ?? "General"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/calendar"
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:mt-auto"
      >
        <CalendarDays className="h-4 w-4" />
        {weekCount > 0
          ? `${weekCount} deadline${weekCount === 1 ? "" : "s"} across the next 7 days`
          : "The next 7 days are clear"}
      </Link>
    </div>
  );
}