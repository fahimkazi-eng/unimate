/**
 * Pure calendar math for /dashboard/calendar (Calendar 2.0, V2 Phase 4).
 * Server-safe: no "use client", no data access — pages hand these helpers
 * date params and task buckets, they hand back grid cells.
 */

import { startOfDay } from "@/lib/dates";

export const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type CalendarView = "month" | "week" | "agenda";

/** A single grid cell (tasks are attached by the page). */
export interface CalendarCell {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
}

const DAY_MS = 86_400_000;

/** Local yyyy-mm-dd key used to bucket tasks onto calendar days. */
export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseViewParam(value: unknown): CalendarView {
  return value === "week" || value === "agenda" ? value : "month";
}

/** "2026-09" → { year, month (0-based) }, or null when invalid. */
export function parseMonthParam(
  value: unknown
): { year: number; month: number } | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  if (year < 2000 || year > 2100 || month < 0 || month > 11) return null;
  return { year, month };
}

/** Validated local "yyyy-mm-dd" day key, or null (rejects Feb 30 etc). */
export function parseDayParam(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (year < 2000 || year > 2100) return null;
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return value;
}

export function monthParam(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

/** Shift a day key by whole days (negative = past). */
export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + days));
}

/** Monday-first 6×7 month grid. */
export function monthCells(
  year: number,
  month: number,
  todayKey: string
): CalendarCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i
    );
    const key = dayKey(date);
    return { date, key, inMonth: date.getMonth() === month, isToday: key === todayKey };
  });
}

/** The 7 days (Monday-first) containing anchorKey. */
export function weekCells(anchorKey: string, todayKey: string): CalendarCell[] {
  const [y, m, d] = anchorKey.split("-").map(Number);
  const anchor = new Date(y, m - 1, d);
  const mondayOffset = (anchor.getDay() + 6) % 7;
  const monday = new Date(y, m - 1, d - mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + i
    );
    const key = dayKey(date);
    return { date, key, inMonth: true, isToday: key === todayKey };
  });
}

/** Tasks bucketed by local day key, preserving clock order. */
export function bucketByDay<T extends { due_date: string | null }>(
  tasks: T[]
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const task of tasks) {
    if (!task.due_date) continue;
    const key = dayKey(new Date(task.due_date));
    const list = map.get(key) ?? [];
    list.push(task);
    map.set(key, list);
  }
  return map;
}

/** "Friday, September 25" heading for a day key. */
export function formatDayHeading(key: string): string {
  return new Date(`${key}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Whole days from today to the given day key (negative = past). */
export function daysFromToday(key: string): number {
  const date = new Date(`${key}T12:00:00`);
  const today = startOfDay(new Date());
  return Math.round((startOfDay(date).getTime() - today.getTime()) / DAY_MS);
}

/** Short weekday + date for week-column headers, e.g. "Mon 21". */
export function formatDayShort(dayKeyValue: string): string {
  return new Date(`${dayKeyValue}T12:00:00`)
    .toLocaleDateString("en", { weekday: "short", day: "numeric" })
    .replace(",", "");
}

/** "Sep 21 – 27, 2026" style range for the week view. */
export function formatWeekRange(cells: CalendarCell[]): string {
  const first = cells[0].date;
  const last = cells[6].date;
  const monthDay = (d: Date) =>
    d.toLocaleDateString("en", { month: "short", day: "numeric" });
  const dayOnly = (d: Date) =>
    d.toLocaleDateString("en", { day: "numeric" });
  const sameMonth =
    first.getMonth() === last.getMonth() &&
    first.getFullYear() === last.getFullYear();
  const range = sameMonth
    ? `${monthDay(first)} \u2013 ${dayOnly(last)}`
    : `${monthDay(first)} \u2013 ${monthDay(last)}`;
  return `${range}, ${last.getFullYear()}`;
}