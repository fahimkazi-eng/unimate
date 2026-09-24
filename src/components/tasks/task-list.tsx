"use client";

import { OptimisticTaskRow } from "./optimistic-task-row";
import type { TaskWithCourse } from "@/lib/database.types";

interface TaskListProps {
  tasks: TaskWithCourse[];
  /** Shown when the list is empty (honest empty state). */
  emptyLabel: string;
}

/**
 * V2 Phase 9 — client-owned task list so complete/delete can animate
 * instantly and optimistically (spec 15). Keys are stable task ids, so a
 * server refresh reconciles rows in place — only new rows play their
 * entrance animation.
 */
export function TaskList({ tasks, emptyLabel }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {tasks.map((task, index) => (
        <OptimisticTaskRow key={task.id} task={task} index={index} />
      ))}
    </ul>
  );
}