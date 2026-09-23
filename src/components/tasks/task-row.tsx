import Link from "next/link";
import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import { deleteTask, toggleTaskComplete } from "@/app/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { TaskWithCourse } from "@/lib/database.types";

const priorityLabel = {
  low: "Low",
  medium: "Medium",
  high: "High",
} as const;

const priorityVariant = {
  low: "outline",
  medium: "default",
  high: "danger",
} as const;

interface TaskRowProps {
  task: TaskWithCourse;
}

/** One task row — toggle complete, edit, delete, all via server actions. */
export function TaskRow({ task }: TaskRowProps) {
  const done = task.status === "completed";

  const subtitle = [
    task.course?.name,
    task.estimated_minutes ? `≈ ${task.estimated_minutes}m` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex items-center gap-3 py-3">
      <form action={toggleTaskComplete.bind(null, task.id)}>
        <Button
          variant="ghost"
          size="sm"
          type="submit"
          className="shrink-0 px-1"
          aria-label={done ? "Mark as not done" : "Mark as done"}
        >
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
      </form>

      <span
        className="h-3 w-3 shrink-0 rounded-full"
        style={{
          backgroundColor: task.course?.color ?? "var(--color-border)",
        }}
        aria-hidden
      />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium",
            done ? "text-muted-foreground line-through" : "text-foreground"
          )}
        >
          {task.title}
        </p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <Badge variant={priorityVariant[task.priority]}>
        {priorityLabel[task.priority]}
      </Badge>

      {task.due_date ? (
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
          {formatRelative(task.due_date)}
        </span>
      ) : null}

      <Link href={`/dashboard/tasks/${task.id}/edit`}>
        <Button variant="ghost" size="sm" aria-label="Edit task">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>

      <form action={deleteTask.bind(null, task.id)}>
        <Button
          variant="ghost"
          size="sm"
          type="submit"
          className="text-danger hover:text-danger"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </form>
    </li>
  );
}