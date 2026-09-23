/**
 * Date helpers for the server-rendered dashboard.
 * V1 keeps everything in the server's local timezone (the dev machine).
 */

const DAY_MS = 86_400_000;

export function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Start and end of "today" over the local midnight boundary. */
export function todayRange(): { start: Date; end: Date } {
  const start = startOfDay(new Date());
  const end = new Date(start.getTime() + DAY_MS);
  return { start, end };
}

/** Whole days from today to the given ISO date (negative = past). */
export function daysUntil(iso: string): number {
  const { start } = todayRange();
  return Math.round(
    (startOfDay(new Date(iso)).getTime() - start.getTime()) / DAY_MS
  );
}

/** "Sep 27" style short date. */
export function formatShort(iso: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

/** Human label for a row: "Due today", "Overdue by 2d", "Due Sep 27". */
export function formatRelative(iso: string): string {
  const days = daysUntil(iso);
  if (days < 0) return `Overdue by ${-days}d`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days < 7) return `Due in ${days}d`;
  return `Due ${formatShort(iso)}`;
}

/** Compact label for a stat card: "Today", "Tomorrow", "Overdue", "Sep 27". */
export function formatDueLabel(iso: string): string {
  const days = daysUntil(iso);
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return formatShort(iso);
}

/** Clock time like "2:30 PM" for session records. */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}