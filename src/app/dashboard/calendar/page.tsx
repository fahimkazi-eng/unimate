import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDatedTasks } from "@/lib/queries";
import type { TaskWithCourse } from "@/lib/database.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Calendar — UniMate",
};

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Local yyyy-mm-dd key used to bucket tasks onto calendar days. */
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseMonthParam(value: string | string[] | undefined): {
  year: number;
  month: number; // 0-based
} | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  if (year < 2000 || year > 2100 || month < 0 || month > 11) return null;
  return { year, month };
}

function parseDayParam(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function monthParam(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

/** Tasks bucketed by local day key (same tz as the calendar). */
function bucketByDay(tasks: TaskWithCourse[]): Map<string, TaskWithCourse[]> {
  const map = new Map<string, TaskWithCourse[]>();
  for (const task of tasks) {
    if (!task.due_date) continue;
    const key = dayKey(new Date(task.due_date));
    const list = map.get(key) ?? [];
    list.push(task);
    map.set(key, list);
  }
  return map;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[]; day?: string | string[] }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const now = new Date();
  const todayKey = dayKey(now);
  const visible =
    parseMonthParam(params.month) ??
    ({ year: now.getFullYear(), month: now.getMonth() } as const);

  const byDay = bucketByDay(await getDatedTasks(user.id));

  // Monday-first grid: 6 weeks × 7 days.
  const firstOfMonth = new Date(visible.year, visible.month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(visible.year, visible.month, 1 - startOffset);
  const cells = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i
    );
    return {
      date,
      key: dayKey(date),
      inMonth: date.getMonth() === visible.month,
      isToday: dayKey(date) === todayKey,
      tasks: byDay.get(dayKey(date)) ?? [],
    };
  });

  // Selected day: ?day= or today (when in view) or the 1st of the month.
  const selectedKey =
    parseDayParam(params.day) ??
    (cells.some((c) => c.inMonth && c.isToday) ? todayKey : `${monthParam(visible.year, visible.month)}-01`);
  const selectedTasks = byDay.get(selectedKey) ?? [];

  const prev = new Date(visible.year, visible.month - 1, 1);
  const next = new Date(visible.year, visible.month + 1, 1);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your semester on a grid — tasks with due dates land here
            automatically.
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/calendar"
            aria-label="Jump to today"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Today
          </Link>
          <Link
            href={`/dashboard/calendar?month=${monthParam(prev.getFullYear(), prev.getMonth())}`}
            aria-label="Previous month"
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href={`/dashboard/calendar?month=${monthParam(next.getFullYear(), next.getMonth())}`}
            aria-label="Next month"
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            {MONTHS[visible.month]} {visible.year}
          </CardTitle>
          <CardDescription>Monday-first · tap a day for its tasks.</CardDescription>
        </CardHeader>

        <CardContent>
          <div
            className="grid grid-cols-7 gap-1"
            role="grid"
            aria-label={`${MONTHS[visible.month]} ${visible.year} calendar`}
          >
            {WEEKDAYS.map((label) => (
              <div
                key={label}
                className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {label}
              </div>
            ))}

            {cells.map((cell) => (
              <Link
                key={cell.key}
                href={`/dashboard/calendar?month=${monthParam(visible.year, visible.month)}&day=${cell.key}`}
                role="gridcell"
                aria-label={`${cell.date.toLocaleDateString()} — ${cell.tasks.length} task${cell.tasks.length === 1 ? "" : "s"}`}
                aria-selected={cell.key === selectedKey}
                className={cn(
                  "flex min-h-[64px] flex-col rounded-lg border p-1.5 transition-colors sm:min-h-[84px]",
                  cell.inMonth
                    ? "border-border bg-surface"
                    : "border-transparent bg-muted/40",
                  cell.isToday && "border-primary/60",
                  cell.key === selectedKey &&
                    "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    cell.isToday
                      ? "bg-primary text-primary-foreground"
                      : cell.inMonth
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                  )}
                >
                  {cell.date.getDate()}
                </span>

                <div className="mt-auto flex flex-wrap gap-0.5">
                  {cell.tasks.slice(0, 3).map((task) => (
                    <span
                      key={task.id}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: task.course?.color ?? "var(--color-primary)" }}
                      aria-hidden
                    />
                  ))}
                  {cell.tasks.length > 3 ? (
                    <span className="text-[10px] font-medium text-muted-foreground">
                      +{cell.tasks.length - 3}
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Day detail */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            {new Date(`${selectedKey}T12:00:00`).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </CardTitle>
          <CardDescription>
            {selectedTasks.length === 0
              ? "Nothing due — enjoy the day."
              : `${selectedTasks.length} task${selectedTasks.length === 1 ? "" : "s"} due.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {selectedTasks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
              No tasks scheduled here. ✨
            </p>
          ) : (
            selectedTasks.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/tasks/${task.id}/edit`}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/40"
              >
                <span
                  className="h-9 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: task.course?.color ?? "var(--color-primary)" }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      task.status === "completed"
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {task.course?.name ?? "No course"} · due{" "}
                    {task.due_date
                      ? new Date(task.due_date).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
                <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "outline"}>
                  {task.priority}
                </Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}