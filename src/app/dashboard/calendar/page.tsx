import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MONTHS,
  WEEKDAYS,
  addDays,
  bucketByDay,
  dayKey,
  daysFromToday,
  formatDayHeading,
  formatDayShort,
  formatWeekRange,
  monthCells,
  monthParam,
  parseDayParam,
  parseMonthParam,
  parseViewParam,
  weekCells,
} from "@/lib/calendar";

export const metadata = {
  title: "Calendar — UniMate",
};

export const dynamic = "force-dynamic";

/* ---------- Shared bits ---------- */

function ViewSwitcher({ view }: { view: "month" | "week" | "agenda" }) {
  const items = [
    { id: "month" as const, label: "Month" },
    { id: "week" as const, label: "Week" },
    { id: "agenda" as const, label: "Agenda" },
  ];
  return (
    <nav
      aria-label="Calendar view"
      className="inline-flex items-center rounded-lg border border-border bg-surface p-0.5"
    >
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/dashboard/calendar${view === item.id ? "" : `?view=${item.id}`}`}
          aria-current={view === item.id ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            view === item.id
              ? "bg-primary-soft text-foreground shadow-glow-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** A task row shared by the day panel and the agenda. */
function TaskLink({ task }: { task: TaskWithCourse }) {
  return (
    <Link
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
      <Badge
        variant={
          task.priority === "high"
            ? "danger"
            : task.priority === "medium"
              ? "warning"
              : "outline"
        }
      >
        {task.priority}
      </Badge>
    </Link>
  );
}

/* ---------- Page ---------- */

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    month?: string;
    day?: string;
  }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const now = new Date();
  const todayKey = dayKey(now);
  const view = parseViewParam(params.view);
  const month =
    parseMonthParam(params.month) ??
    ({ year: now.getFullYear(), month: now.getMonth() } as const);

  const byDay = bucketByDay(await getDatedTasks(user.id));

  // Selected day for the grid views (?day= or a sensible default).
  let selectedKey: string | null = null;
  if (view === "month" || view === "week") {
    selectedKey = parseDayParam(params.day);
    if (!selectedKey) {
      if (view === "month") {
        const cells = monthCells(month.year, month.month, todayKey);
        selectedKey = cells.some((c) => c.inMonth && c.isToday)
          ? todayKey
          : `${monthParam(month.year, month.month)}-01`;
      } else {
        selectedKey = todayKey;
      }
    }
  }

  const selectedKeySafe = selectedKey ?? todayKey;

  const monthCellsForView =
    view === "month"
      ? monthCells(month.year, month.month, todayKey).map((cell) => ({
          ...cell,
          tasks: byDay.get(cell.key) ?? [],
        }))
      : [];

  const weekCellsForView =
    view === "week"
      ? weekCells(selectedKeySafe, todayKey).map((cell) => ({
          ...cell,
          tasks: byDay.get(cell.key) ?? [],
        }))
      : [];

  const selectedTasks = selectedKey ? byDay.get(selectedKey) ?? [] : [];
  const agendaDays = view === "agenda" ? Array.from(byDay.entries()) : [];

  const prev =
    view === "month"
      ? monthCellsForView.length > 0
        ? new Date(month.year, month.month - 1, 1)
        : null
      : null;
  const next =
    view === "month"
      ? new Date(month.year, month.month + 1, 1)
      : null;

  const navPrevHref =
    view === "month" && prev
      ? `/dashboard/calendar?view=month&month=${monthParam(prev.getFullYear(), prev.getMonth())}`
      : view === "week"
        ? `/dashboard/calendar?view=week&day=${addDays(selectedKeySafe, -7)}`
        : null;
  const navNextHref =
    view === "month" && next
      ? `/dashboard/calendar?view=month&month=${monthParam(next.getFullYear(), next.getMonth())}`
      : view === "week"
        ? `/dashboard/calendar?view=week&day=${addDays(selectedKeySafe, 7)}`
        : null;

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

        <div className="flex flex-wrap items-center gap-2">
          <ViewSwitcher view={view} />

          {view !== "agenda" ? (
            <div className="ml-1 flex items-center gap-1">
              <Link
                href={
                  view === "week"
                    ? "/dashboard/calendar?view=week"
                    : "/dashboard/calendar?view=month"
                }
                aria-label="Jump to today"
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Today
              </Link>
              {navPrevHref ? (
                <Link
                  href={navPrevHref}
                  aria-label="Previous"
                  className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              ) : null}
              {navNextHref ? (
                <Link
                  href={navNextHref}
                  aria-label="Next"
                  className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      {/* Month grid */}
      {view === "month" ? (
        <Card className="mt-6">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {MONTHS[month.month]} {month.year}
            </CardTitle>
            <CardDescription>Monday-first · tap a day for its tasks.</CardDescription>
          </CardHeader>

          <CardContent>
            <div
              className="grid grid-cols-7 gap-1"
              role="grid"
              aria-label={`${MONTHS[month.month]} ${month.year} calendar`}
            >
              {WEEKDAYS.map((label) => (
                <div
                  key={label}
                  className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {label}
                </div>
              ))}

              {monthCellsForView.map((cell) => (
                <Link
                  key={cell.key}
                  href={`/dashboard/calendar?view=month&month=${monthParam(month.year, month.month)}&day=${cell.key}`}
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
      ) : null}

      {/* Week view */}
      {view === "week" ? (
        <Card className="mt-6">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {formatWeekRange(weekCellsForView)}
            </CardTitle>
            <CardDescription>Monday-first · tap a day for its tasks.</CardDescription>
          </CardHeader>

          <CardContent>
            <div
              className="grid min-w-[560px] grid-cols-7 gap-1 overflow-x-auto"
              role="grid"
              aria-label={`Week of ${formatWeekRange(weekCellsForView)}`}
            >
              {WEEKDAYS.map((label) => (
                <div
                  key={label}
                  className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {label}
                </div>
              ))}

              {weekCellsForView.map((cell) => (
                <Link
                  key={cell.key}
                  href={`/dashboard/calendar?view=week&day=${cell.key}`}
                  role="gridcell"
                  aria-label={`${formatDayHeading(cell.key)} — ${cell.tasks.length} task${cell.tasks.length === 1 ? "" : "s"}`}
                  aria-selected={cell.key === selectedKey}
                  className={cn(
                    "flex min-h-[120px] flex-col rounded-lg border bg-surface p-1.5 transition-colors",
                    cell.isToday ? "border-primary/60" : "border-border",
                    cell.key === selectedKey &&
                      "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  <span
                    className={cn(
                      "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                      cell.isToday
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    {cell.date.getDate()}
                  </span>

                  <div className="mt-2 flex flex-col gap-1">
                    {cell.tasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className="flex items-center gap-1 truncate text-[10px] font-medium text-muted-foreground"
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: task.course?.color ?? "var(--color-primary)" }}
                          aria-hidden
                        />
                        <span className="truncate">{task.title}</span>
                      </span>
                    ))}
                    {cell.tasks.length > 3 ? (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        +{cell.tasks.length - 3} more
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Agenda view */}
      {view === "agenda" ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Upcoming deadlines
            </CardTitle>
            <CardDescription>
              Everything with a due date, in order. Overdue first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {agendaDays.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
                Nothing scheduled yet — add a task with a due date. ✨
              </p>
            ) : (
              agendaDays.map(([key, tasks]) => {
                const days = daysFromToday(key);
                const tag =
                  days < 0
                    ? "Overdue"
                    : days === 0
                      ? "Today"
                      : days === 1
                        ? "Tomorrow"
                        : null;
                return (
                  <section key={key} aria-labelledby={`day-${key}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <h2
                        id={`day-${key}`}
                        className="text-sm font-semibold tracking-wide text-foreground"
                      >
                        {formatDayHeading(key)}
                      </h2>
                      {tag ? (
                        <Badge variant={days < 0 ? "danger" : "default"}>{tag}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {formatDayShort(key)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <TaskLink key={task.id} task={task} />
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Day detail (grid views only) */}
      {view === "month" || view === "week" ? (
        <Card className="mt-6">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>
                {formatDayHeading(selectedKeySafe)}
              </CardTitle>
              <CardDescription>
                {selectedTasks.length === 0
                  ? "Nothing due — enjoy the day."
                  : `${selectedTasks.length} task${selectedTasks.length === 1 ? "" : "s"} due.`}
              </CardDescription>
            </div>
            <Button href={`/dashboard/tasks?due=${selectedKeySafe}`} size="sm">
              <Plus className="h-4 w-4" />
              Add task on this day
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedTasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
                No tasks scheduled here. ✨
              </p>
            ) : (
              selectedTasks.map((task) => (
                <TaskLink key={task.id} task={task} />
              ))
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}