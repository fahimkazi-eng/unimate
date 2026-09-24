/**
 * Pure Smart Planner math for /dashboard/planner (V2 Phase 6).
 * Server-safe: no "use client", no data access — pages hand in real open
 * tasks + today's key, get back a deterministic 7-day plan.
 *
 * The plan is ADVISORY by construction (spec 37): it never writes, never
 * moves due dates, never creates calendar events. Every planned task still
 * opens its edit page so the user confirms.
 */

import { addDays } from "@/lib/calendar";
import { startOfDay } from "@/lib/dates";
import type { TaskWithCourse, TaskPriority } from "@/lib/database.types";

/** Working assumption when a task has no estimate (honest, displayed). */
export const DEFAULT_ESTIMATE_MINUTES = 25;

export const BUDGET_MIN = 30;
export const BUDGET_MAX = 300;
export const BUDGET_DEFAULT = 120;

const DAY_MS = 86_400_000;

/** Validated ?budget= param — clamps into [30, 300], default 120. */
export function parseBudgetParam(value: unknown): number {
  if (typeof value !== "string") return BUDGET_DEFAULT;
  const n = Number(value);
  if (!Number.isFinite(n)) return BUDGET_DEFAULT;
  return Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, Math.round(n)));
}

const priorityWeight: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function estMinutes(task: TaskWithCourse): number {
  return task.estimated_minutes ?? DEFAULT_ESTIMATE_MINUTES;
}

/** Whole days from todayKey to the task's due date (negative = past). */
function dueOffset(task: TaskWithCourse, todayKey: string): number | null {
  if (!task.due_date) return null;
  return Math.round(
    (startOfDay(new Date(task.due_date)).getTime() -
      startOfDay(new Date(`${todayKey}T12:00:00`)).getTime()) /
      DAY_MS
  );
}

export interface PlannedTask {
  task: TaskWithCourse;
  /** 0 = today … 6 = six days out. */
  dayOffset: number;
  /** Task was already past due when the plan ran. */
  overdue: boolean;
  /** Planned AFTER its due date — flagged as a risk the user must confirm. */
  late: boolean;
}

export interface PlannedDay {
  offset: number;
  key: string;
  tasks: PlannedTask[];
  minutes: number;
  /** Sum exceeds the budget — honest warning, not hidden. */
  overload: boolean;
}

export interface PlannerResult {
  days: PlannedDay[];
  /** Real tasks that fit nowhere this week (still shown, honestly). */
  unassigned: TaskWithCourse[];
  plannedCount: number;
  plannedMinutes: number;
  overloadDays: number;
  lateTasks: number;
}

/**
 * Deterministic 7-day plan from real open tasks:
 * 1. Overdue tasks land first — earliest day with room; overflow flows on.
 *    A task too big for any remaining slot is force-placed on the lightest
 *    day (the day is marked overloaded) so nothing overdue is ever stranded.
 * 2. Dated tasks are back-planned: the LATEST day ≤ their due date that has
 *    room, so work lands close to the deadline but never after it. If no
 *    pre-deadline slot exists, they fall back to the lightest day and are
 *    honestly flagged `late`.
 * 3. Undated tasks fill the lightest remaining days, high priority first.
 * Completed tasks are always ignored. Same input → same output (pure).
 */
export function planWeek(
  tasks: TaskWithCourse[],
  todayKey: string,
  budgetMinutes = BUDGET_DEFAULT
): PlannerResult {
  const open = tasks.filter((t) => t.status !== "completed");

  const days: PlannedDay[] = Array.from({ length: 7 }, (_, offset) => ({
    offset,
    key: addDays(todayKey, offset),
    tasks: [],
    minutes: 0,
    overload: false,
  }));
  const remaining = days.map(() => budgetMinutes);
  const plan: PlannedTask[] = [];
  const unassigned: TaskWithCourse[] = [];

  const lightestFittingDay = (mins: number): number => {
    let best = -1;
    for (let i = 0; i < 7; i++) {
      if (remaining[i] >= mins && (best === -1 || remaining[i] > remaining[best])) {
        best = i;
      }
    }
    return best;
  };

  const placeOn = (task: TaskWithCourse, idx: number): void => {
    plan.push({ task, dayOffset: idx, overdue: false, late: false });
    remaining[idx] -= estMinutes(task);
  };

  const bySoonestDue = (a: TaskWithCourse, b: TaskWithCourse): number => {
    const d =
      new Date(a.due_date as string).getTime() -
      new Date(b.due_date as string).getTime();
    return d !== 0 ? d : priorityWeight[a.priority] - priorityWeight[b.priority];
  };

  // 1. Overdue — earliest day with room first, then force onto lightest day.
  const overdue = open
    .filter((t) => (dueOffset(t, todayKey) ?? 0) < 0)
    .sort(bySoonestDue);
  for (const task of overdue) {
    const mins = estMinutes(task);
    const idx = [0, 1, 2, 3, 4, 5, 6].find((i) => remaining[i] >= mins);
    if (idx !== undefined) {
      placeOn(task, idx);
      plan[plan.length - 1].overdue = true;
    } else {
      const lightest = [0, 1, 2, 3, 4, 5, 6].reduce((best, i) =>
        remaining[i] > remaining[best] ? i : best
      );
      placeOn(task, lightest);
      plan[plan.length - 1].overdue = true;
    }
  }

  // 2. Dated — back-plan: latest day ≤ due date with room, else lightest,
  //    flagged `late` when that lands after the due date.
  const dated = open
    .filter((t) => {
      const off = dueOffset(t, todayKey);
      return off !== null && off >= 0;
    })
    .sort(bySoonestDue);
  for (const task of dated) {
    const mins = estMinutes(task);
    const off = dueOffset(task, todayKey) as number;
    const maxIdx = Math.min(6, off);
    let idx = -1;
    for (let i = maxIdx; i >= 0; i--) {
      if (remaining[i] >= mins) {
        idx = i;
        break;
      }
    }
    if (idx === -1) {
      idx = lightestFittingDay(mins);
      if (idx !== -1) {
        placeOn(task, idx);
        plan[plan.length - 1].late = idx > maxIdx;
        continue;
      }
      unassigned.push(task);
      continue;
    }
    placeOn(task, idx);
  }

  // 3. Undated — lightest day with room, high priority first (sorted above).
  const undated = open
    .filter((t) => t.due_date === null)
    .sort(
      (a, b) =>
        priorityWeight[a.priority] - priorityWeight[b.priority] ||
        a.title.localeCompare(b.title)
    );
  for (const task of undated) {
    const idx = lightestFittingDay(estMinutes(task));
    if (idx === -1) {
      unassigned.push(task);
      continue;
    }
    placeOn(task, idx);
  }

  // Assemble days.
  for (const slot of plan) {
    const day = days[slot.dayOffset];
    day.tasks.push(slot);
    day.minutes += estMinutes(slot.task);
  }
  for (const day of days) {
    day.tasks.sort(
      (a, b) =>
        (a.overdue === b.overdue ? 0 : a.overdue ? -1 : 1) ||
        priorityWeight[a.task.priority] - priorityWeight[b.task.priority] ||
        a.task.title.localeCompare(b.task.title)
    );
    day.overload = day.minutes > budgetMinutes;
  }

  return {
    days,
    unassigned,
    plannedCount: plan.length,
    plannedMinutes: plan.reduce((sum, p) => sum + estMinutes(p.task), 0),
    overloadDays: days.filter((d) => d.overload).length,
    lateTasks: plan.filter((p) => p.late).length,
  };
}