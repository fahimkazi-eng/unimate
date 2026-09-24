/**
 * Pure Emergency Mode math for /dashboard/emergency (V2 Phase 8).
 * Server-safe: no data access — the page hands in the user's real open tasks
 * and gets back crisis detection + honest load math.
 *
 * ADVISORY by construction (spec 37): this module never writes, never moves
 * due dates, never schedules anything. It only points at what's real.
 */

import { startOfDay, formatTime } from "@/lib/dates";
import { DEFAULT_ESTIMATE_MINUTES } from "@/lib/planner";
import type { TaskWithCourse, TaskPriority } from "@/lib/database.types";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

/** How far out a deadline still counts as "time is short". */
export const CRISIS_WINDOW_DAYS = 7;

function dayOffsetFrom(todayKey: string, iso: string): number {
  return Math.round(
    (startOfDay(new Date(iso)).getTime() -
      startOfDay(new Date(`${todayKey}T12:00:00`)).getTime()) /
      DAY_MS
  );
}

export interface Crisis {
  task: TaskWithCourse;
  kind: "overdue" | "due";
  /** Whole days: negative = overdue by N, 0 = today, positive = in N days. */
  daysLeft: number;
  /** Signed hours until the due moment (negative = overdue). */
  hoursLeft: number;
  /** Human headline: "Overdue by 2 days", "Due today · 5:00 PM", … */
  headline: string;
}

/**
 * The single most urgent open task — the earliest-due one — but ONLY when
 * time is actually short (overdue or due within CRISIS_WINDOW_DAYS). A
 * deadline three weeks out is not an emergency; returning null lets the page
 * say so honestly.
 */
export function detectCrisis(
  tasks: TaskWithCourse[],
  todayKey: string,
  nowIso: string
): Crisis | null {
  const open = tasks
    .filter((t) => t.status !== "completed" && t.due_date)
    .sort(
      (a, b) =>
        new Date(a.due_date as string).getTime() -
        new Date(b.due_date as string).getTime()
    );
  const first = open[0];
  if (!first) return null;

  const dueIso = first.due_date as string;
  const off = dayOffsetFrom(todayKey, dueIso);
  if (off > CRISIS_WINDOW_DAYS) return null;

  const hoursLeft = (new Date(dueIso).getTime() - new Date(nowIso).getTime()) / HOUR_MS;
  const kind: Crisis["kind"] = hoursLeft < 0 ? "overdue" : "due";
  const h = Math.round(Math.abs(hoursLeft));
  const d = Math.abs(off);

  let headline: string;
  if (kind === "overdue") {
    headline =
      d >= 1
        ? `Overdue by ${d} day${d === 1 ? "" : "s"}`
        : `Overdue by ~${Math.max(1, h)} hour${Math.max(1, h) === 1 ? "" : "s"}`;
  } else if (off === 0) {
    headline = `Due today · ${formatTime(dueIso)}`;
  } else if (off === 1) {
    headline = "Due tomorrow";
  } else if (hoursLeft <= 48) {
    headline = `Due in ~${Math.max(1, Math.ceil(hoursLeft))} hour${
      Math.max(1, Math.ceil(hoursLeft)) === 1 ? "" : "s"
    }`;
  } else {
    headline = `Due in ${off} days`;
  }

  return { task: first, kind, daysLeft: off, hoursLeft, headline };
}

export interface Crunch {
  /** Estimated minutes across the urgent load (overdue + due ≤ 7 days). */
  minutes: number;
  taskCount: number;
  overdueCount: number;
  dueTodayCount: number;
}

/** Real load math: open tasks that are overdue or due within the window. */
export function crunchLoad(tasks: TaskWithCourse[], todayKey: string): Crunch {
  const crunch: Crunch = {
    minutes: 0,
    taskCount: 0,
    overdueCount: 0,
    dueTodayCount: 0,
  };
  for (const t of tasks) {
    if (t.status === "completed" || !t.due_date) continue;
    const off = dayOffsetFrom(todayKey, t.due_date);
    if (off > CRISIS_WINDOW_DAYS) continue;
    crunch.taskCount += 1;
    crunch.minutes += t.estimated_minutes ?? DEFAULT_ESTIMATE_MINUTES;
    if (off < 0) crunch.overdueCount += 1;
    if (off === 0) crunch.dueTodayCount += 1;
  }
  return crunch;
}

/**
 * How many 25-minute sprints the load roughly equals (0 when nothing is
 * ahead). Estimates are the user's own; missing ones count as 25 min —
 * stated everywhere, never silent.
 */
export function sprintEstimate(minutes: number): number {
  if (minutes <= 0) return 0;
  return Math.max(1, Math.ceil(minutes / DEFAULT_ESTIMATE_MINUTES));
}

/**
 * Advisory "what can wait" list: open, low-priority, undated tasks. These
 * are the safest to postpone — nothing is moved for the user.
 */
export function deferrableList(tasks: TaskWithCourse[]): TaskWithCourse[] {
  return tasks
    .filter(
      (t) =>
        t.status !== "completed" && t.priority === "low" && t.due_date === null
    )
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** Priority badge tone for the crisis card. */
export function priorityTone(
  priority: TaskPriority
): "danger" | "warning" | "default" {
  return priority === "high" ? "danger" : priority === "medium" ? "warning" : "default";
}