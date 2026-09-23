import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/dates";
import type { TaskWithCourse } from "@/lib/database.types";

const priorityVariant = {
  low: "outline",
  medium: "default",
  high: "danger",
} as const;

interface DeadlineListProps {
  tasks: TaskWithCourse[];
  empty: string;
}

/** A task list with course color dot, priority and relative due label. */
export function DeadlineList({ tasks, empty }: DeadlineListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-3 py-3">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: task.course?.color ?? "var(--color-border)" }}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {task.title}
            </p>
            {task.course?.name ? (
              <p className="truncate text-xs text-muted-foreground">
                {task.course.name}
              </p>
            ) : null}
          </div>
          <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
          {task.due_date ? (
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatRelative(task.due_date)}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}