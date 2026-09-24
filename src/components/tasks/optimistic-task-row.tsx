"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
} from "lucide-react";
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

const ERROR_HIDE_MS = 4000;

interface OptimisticTaskRowProps {
  task: TaskWithCourse;
  /** Used only for the entrance stagger — visuals never depend on it. */
  index?: number;
}

/**
 * V2 Phase 9 — one task row with optimistic complete/delete (spec 15).
 *
 * Instead of `useOptimistic` (whose value reverts the moment the transition
 * ends, before `router.refresh()` — a fire-and-forget `void` in Next 16 —
 * delivers the fresh payload), we keep a tiny per-row override that persists
 * until the row unmounts. That's safe here because a successful complete or
 * delete always moves the row out of its current list, so the fresh mount
 * re-reads the server prop; failures clear the override explicitly.
 * Net effect: the check or delete applies INSTANTLY, never flickers, and a
 * failed action reverts the row and shows the real error — no silent failures.
 */
export function OptimisticTaskRow({ task, index = 0 }: OptimisticTaskRowProps) {
  const router = useRouter();
  const realDone = task.status === "completed";
  // null = trust the server prop; true/false = optimistic override in flight.
  const [override, setOverride] = useState<boolean | null>(null);
  const done = override ?? realDone;
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!error) return;
    errorTimer.current = setTimeout(() => setError(null), ERROR_HIDE_MS);
    return () => {
      if (errorTimer.current) clearTimeout(errorTimer.current);
    };
  }, [error]);

  const subtitle = [
    task.course?.name,
    task.estimated_minutes ? `≈ ${task.estimated_minutes}m` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const toggle = () => {
    if (isPending) return;
    setError(null);
    startTransition(async () => {
      const next = !realDone;
      setOverride(next);
      const res = await toggleTaskComplete(task.id);
      if (!res.ok) {
        setOverride(null); // immediate honest revert
        setError(res.message ?? "Couldn't update this task.");
        router.refresh();
        return;
      }
      router.refresh();
    });
  };

  const remove = () => {
    if (isPending) return;
    setError(null);
    setLeaving(true);
    startTransition(async () => {
      const res = await deleteTask(task.id);
      if (!res.ok) {
        setLeaving(false);
        setError(res.message ?? "Couldn't delete this task.");
        router.refresh();
        return;
      }
      router.refresh();
    });
  };

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-3 py-3 animate-row-in",
        leaving && "pointer-events-none animate-row-exit"
      )}
      style={{ animationDelay: leaving ? undefined : `${Math.min(index, 6) * 35}ms` }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        aria-pressed={done}
        className="shrink-0 px-1 min-h-11 min-w-11 -my-1.5 sm:min-h-8 sm:min-w-8 sm:my-0"
      >
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-success animate-scale-in" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>

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
            done
              ? "text-muted-foreground line-through transition-colors duration-200"
              : "text-foreground"
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
        <span
          className={cn(
            "hidden shrink-0 text-xs text-muted-foreground sm:inline",
            task.status !== "completed" &&
              formatRelative(task.due_date).startsWith("Overdue") &&
              "text-danger"
          )}
        >
          {formatRelative(task.due_date)}
        </span>
      ) : null}

      <Link href={`/dashboard/tasks/${task.id}/edit`}>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Edit task"
          className="min-h-11 min-w-11 -my-1.5 sm:min-h-8 sm:min-w-8 sm:my-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={remove}
        className="shrink-0 text-danger hover:text-danger min-h-11 min-w-11 -my-1.5 sm:min-h-8 sm:min-w-8 sm:my-0"
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {error ? (
        <p
          role="alert"
          className="flex basis-full items-center gap-1.5 px-1 text-xs text-danger animate-fade-in-fast"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </li>
  );
}