import { Clock3, Flag, Play, Sparkles } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { daysUntil, formatRelative } from "@/lib/dates";
import type { TaskWithCourse } from "@/lib/database.types";

const priorityVariant: Record<TaskWithCourse["priority"], BadgeVariant> = {
  high: "danger",
  medium: "warning",
  low: "outline",
};

function formatMinutes(minutes: number | null): string {
  if (!minutes) return "No estimate";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
}

interface NextMoveWidgetProps {
  task: TaskWithCourse | null;
}

/**
 * "Your next move" — the dashboard's headline widget (spec §26).
 * The pick comes from `pickNextMove` (deterministic rules, no AI) and the
 * Start Focus button deep-links into the focus timer with the course
 * preselected so starting costs exactly one click.
 */
export function NextMoveWidget({ task }: NextMoveWidgetProps) {
  if (!task) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Sparkles className="h-6 w-6" />
        </span>
        <div>
          <p className="text-base font-semibold text-foreground">
            You&apos;re all caught up
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Nothing is waiting on you right now. Add a task when your next
            deadline lands.
          </p>
        </div>
        <Button variant="outline" href="/dashboard/tasks">
          Add a task
        </Button>
      </Card>
    );
  }

  const overdue = task.due_date ? daysUntil(task.due_date) < 0 : false;
  const focusHref = task.course
    ? `/dashboard/focus?course=${task.course.id}`
    : "/dashboard/focus";

  return (
    <Card className="relative h-full overflow-hidden border-primary/30 shadow-glow-accent">
      {/* Course accent rail — falls back to the brand gradient. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-primary"
        style={
          task.course
            ? { background: task.course.color }
            : undefined
        }
      />

      <div className="flex h-full flex-col gap-5 p-6 sm:p-7">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Your next move
          </span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        <div>
          <p className="text-xl font-bold leading-snug text-foreground sm:text-2xl">
            {task.title}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {task.course && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: task.course.color }}
                />
                {task.course.name}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {task.due_date && (
              <Badge variant={overdue ? "danger" : "default"}>
                {formatRelative(task.due_date)}
              </Badge>
            )}
            <Badge variant={priorityVariant[task.priority]}>
              <Flag className="h-3 w-3" />
              {task.priority} priority
            </Badge>
            <Badge variant="outline">
              <Clock3 className="h-3 w-3" />
              {formatMinutes(task.estimated_minutes)}
            </Badge>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-3">
          <Button href={focusHref}>
            <Play className="h-4 w-4" />
            Start focus
          </Button>
          <span className="text-xs text-muted-foreground">
            Picked from your deadlines, priority and estimates.
          </span>
        </div>
      </div>
    </Card>
  );
}
