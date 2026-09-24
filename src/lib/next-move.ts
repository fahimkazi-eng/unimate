import type { TaskWithCourse } from "@/lib/database.types";

const priorityWeight: Record<TaskWithCourse["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function byUrgency(a: TaskWithCourse, b: TaskWithCourse): number {
  // Soonest due date first — overdue tasks surface before everything else.
  const byDate =
    new Date(a.due_date ?? 0).getTime() - new Date(b.due_date ?? 0).getTime();
  if (byDate !== 0) return byDate;
  // Higher priority breaks ties.
  const byPriority = priorityWeight[a.priority] - priorityWeight[b.priority];
  if (byPriority !== 0) return byPriority;
  // Bigger estimated effort breaks the last tie (biggest impact, fewest clicks).
  return (b.estimated_minutes ?? 0) - (a.estimated_minutes ?? 0);
}

/**
 * Deterministic "Your next move" recommendation — honest rules, no AI:
 * 1. Unfinished tasks with a due date, soonest first.
 * 2. Higher priority breaks ties.
 * 3. Larger estimated effort breaks the final tie.
 * Falls back to the most important unfinished task without a date,
 * and to `null` when everything is done.
 */
export function pickNextMove(tasks: TaskWithCourse[]): TaskWithCourse | null {
  const open = tasks.filter((task) => task.status !== "completed");

  const withDate = open
    .filter((task) => task.due_date)
    .sort(byUrgency);
  if (withDate.length > 0) return withDate[0];

  const withoutDate = open.filter((task) => !task.due_date).sort(byUrgency);
  return withoutDate[0] ?? null;
}