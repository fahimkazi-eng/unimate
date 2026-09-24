import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatRelative } from "@/lib/dates";
import type { TaskWithCourse } from "@/lib/database.types";

/**
 * V3 Phase B §8 — Deadlines, urgency hierarchy.
 * Overdue is the only red anywhere on this panel — urgency is local, never
 * the whole app turning red.
 */

interface DeadlinesPanelProps {
  overdue: TaskWithCourse[];
  today: TaskWithCourse[];
  tomorrow: TaskWithCourse[];
  thisWeek: TaskWithCourse[];
}

interface Bucket {
  label: string;
  tasks: TaskWithCourse[];
  tone: "danger" | "attention" | "default";
}

export function DeadlinesPanel({
  overdue,
  today,
  tomorrow,
  thisWeek,
}: DeadlinesPanelProps) {
  const counts: Record<string, number> = {
    Overdue: overdue.length,
    Today: today.length,
    Tomorrow: tomorrow.length,
    "This week": thisWeek.length,
  };

  const buckets: Bucket[] = [
    { label: "Overdue", tasks: overdue.slice(0, 3), tone: "danger" },
    { label: "Today", tasks: today.slice(0, 3), tone: "attention" },
    { label: "Tomorrow", tasks: tomorrow.slice(0, 3), tone: "default" },
    { label: "This week", tasks: thisWeek.slice(0, 3), tone: "default" },
  ];

  const total =
    overdue.length + today.length + tomorrow.length + thisWeek.length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">
          Deadlines
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {total}
          </span>
        </p>
        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <p className="text-sm font-medium text-foreground">
            Nothing urgent right now
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            No open deadlines this week — enjoy the breathing room.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-1 flex-col gap-3">
          {buckets.map((bucket) =>
            bucket.tasks.length > 0 ? (
              <div key={bucket.label}>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    bucket.tone === "danger"
                      ? "text-danger"
                      : bucket.tone === "attention"
                        ? "text-warning"
                        : "text-muted-foreground"
                  }`}
                >
                  {bucket.label}
                  {bucket.tasks.length < counts[bucket.label]
                    ? ` · +${counts[bucket.label] - bucket.tasks.length} more`
                    : ""}
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  {bucket.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2"
                    >
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          background:
                            task.course?.color ?? "var(--color-primary)",
                        }}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                        {task.title}
                      </span>
                      <span
                        className={`shrink-0 text-xs ${
                          bucket.tone === "danger"
                            ? "font-medium text-danger"
                            : "text-muted-foreground"
                        }`}
                      >
                        {task.due_date ? formatRelative(task.due_date) : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}