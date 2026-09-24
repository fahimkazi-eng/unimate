import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { TaskWithCourse } from "@/lib/database.types";

/**
 * V3 Phase B §11 — Calendar preview (NOT the full calendar).
 * Shows what the next few days actually hold from the user's dated tasks,
 * then hands off to the full Calendar page.
 */

interface CalendarPreviewProps {
  /** Tasks due today, most urgent first. */
  today: TaskWithCourse[];
  /** Tasks due tomorrow. */
  tomorrow: TaskWithCourse[];
  /** Total dated tasks across the next 7 days (incl. today/tomorrow). */
  weekCount: number;
}

export function CalendarPreview({ today, tomorrow, weekCount }: CalendarPreviewProps) {
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

      <div className="mt-3 flex flex-1 flex-col gap-3">
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

        <Link
          href="/dashboard/calendar"
          className="mt-auto inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <CalendarDays className="h-4 w-4" />
          {weekCount > 0
            ? `${weekCount} deadline${weekCount === 1 ? "" : "s"} across the next 7 days`
            : "The next 7 days are clear"}
        </Link>
      </div>
    </div>
  );
}