import Link from "next/link";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { daysUntil, formatRelative } from "@/lib/dates";
import type { TaskWithCourse } from "@/lib/database.types";

/**
 * V3 Phase B §7 — Today, as a timeline.
 * Tasks carry dates, not clock times, so we show an honest vertical
 * timeline (due-today work, most urgent first) instead of invented hours.
 * Overdue items are pinned first and marked in red.
 */

interface TodayTimelineProps {
  /** Overdue then due-today, already sorted most-urgent-first. */
  tasks: TaskWithCourse[];
}

export function TodayTimeline({ tasks }: TodayTimelineProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div>
          <p className="text-base font-semibold text-foreground">
            Your day is clear
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Nothing due today. Use the time to get ahead.
          </p>
        </div>
        <Button variant="outline" href="/dashboard/planner">
          Plan my day
        </Button>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {tasks.map((task, index) => {
        const overdue = task.due_date ? daysUntil(task.due_date) < 0 : false;
        const last = index === tasks.length - 1;
        return (
          <li key={task.id} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Timeline rail */}
            <span className="flex flex-col items-center">
              <span
                aria-hidden
                className="mt-1.5 h-3 w-3 shrink-0 rounded-full ring-4 ring-surface"
                style={{
                  background:
                    task.course?.color ??
                    (overdue ? "var(--color-danger)" : "var(--color-primary)"),
                }}
              />
              {!last && (
                <span aria-hidden className="mt-1 w-px flex-1 bg-border" />
              )}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={`truncate text-sm font-medium ${
                  overdue ? "text-danger" : "text-foreground"
                }`}
              >
                {task.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {task.course?.name ?? "General"}
                {task.due_date ? ` · ${formatRelative(task.due_date)}` : ""}
              </p>
            </div>

            <CircleDashed className="h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden />
          </li>
        );
      })}

      <li className="pt-2">
        <Link
          href="/dashboard/tasks"
          className="text-xs font-medium text-primary hover:underline"
        >
          Open all tasks →
        </Link>
      </li>
    </ol>
  );
}