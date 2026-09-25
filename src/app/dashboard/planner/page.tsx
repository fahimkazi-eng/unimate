import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getTasks } from "@/lib/queries";
import {
  BUDGET_DEFAULT,
  DEFAULT_ESTIMATE_MINUTES,
  parseBudgetParam,
  planWeek,
  type PlannedDay,
  type PlannedTask,
} from "@/lib/planner";
import { dayKey, formatDayHeading } from "@/lib/calendar";
import { formatRelative } from "@/lib/dates";
import {
  Badge,
  type BadgeVariant,
} from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Inbox,
  Sparkles,
} from "lucide-react";
import type { TaskPriority } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Smart Planner — UniMate",
};

export const dynamic = "force-dynamic";

const BUDGET_OPTIONS = [60, 90, BUDGET_DEFAULT, 180] as const;

const priorityVariant: Record<TaskPriority, BadgeVariant> = {
  high: "danger",
  medium: "warning",
  low: "outline",
};

function minutesLabel(minutes: number): string {
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function DayHeader({ day }: { day: PlannedDay }) {
  const offset = day.offset;
  const label =
    offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : formatDayHeading(day.key);
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-lg font-semibold text-foreground">{label}</h2>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {minutesLabel(day.minutes)}
        {day.overload ? " · over budget" : ""}
      </span>
    </div>
  );
}

function PlannedRow({ slot }: { slot: PlannedTask }) {
  const { task } = slot;
  const estimate = task.estimated_minutes ?? DEFAULT_ESTIMATE_MINUTES;
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
        <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {task.course && <span className="truncate">{task.course.name}</span>}
          {task.due_date && <span>{formatRelative(task.due_date)}</span>}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {minutesLabel(estimate)}
          </span>
        </div>
      </div>
      <Badge variant={priorityVariant[task.priority]}>
        {task.priority}
      </Badge>
      {slot.overdue && <Badge variant="danger">overdue</Badge>}
      {slot.late && (
        <Badge variant="warning">
          <AlertTriangle className="mr-1 h-3 w-3" /> after due date
        </Badge>
      )}
    </Link>
  );
}

function BudgetSwitcher({ budget }: { budget: number }) {
  return (
    <nav
      aria-label="Daily time budget"
      className="inline-flex items-center rounded-lg border border-border bg-surface p-0.5"
    >
      {BUDGET_OPTIONS.map((option) => (
        <Link
          key={option}
          href={`/dashboard/planner${budget === option ? "" : `?budget=${option}`}`}
          aria-current={budget === option ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            budget === option
              ? "bg-primary-soft text-foreground shadow-glow-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {minutesLabel(option)}
        </Link>
      ))}
    </nav>
  );
}

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const budget = parseBudgetParam(params.budget);

  const tasks = await getTasks(user.id);
  const todayKey = dayKey(new Date());

  const plan = planWeek(tasks, todayKey, budget);
  const unassignedBig = plan.unassigned.filter(
    (t) => (t.estimated_minutes ?? DEFAULT_ESTIMATE_MINUTES) > budget
  );

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Smart Planner</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Your open tasks, spread across the next 7 days — overdue first,
              deadlined tasks kept to their due date, within a daily budget you
              control.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <BudgetSwitcher budget={budget} />
            <p className="text-xs text-muted-foreground">daily budget</p>
          </div>
        </div>
      </header>

      {plan.plannedCount === 0 && plan.unassigned.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">
                Nothing to plan
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                You have no open tasks. Add one and the planner will place it.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-6 grid [&>*]:min-w-0 gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Planned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {plan.plannedCount}{" "}
                  <span className="text-base font-normal text-muted-foreground">
                    task{plan.plannedCount === 1 ? "" : "s"}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {minutesLabel(plan.plannedMinutes)} of work placed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarClock className="h-4 w-4 text-accent" />
                  Over budget
                </CardTitle>
                <CardDescription>Days exceeding the budget</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {plan.overloadDays}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    day{plan.overloadDays === 1 ? "" : "s"}
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-accent" />
                  After due date
                </CardTitle>
                <CardDescription>Tasks planned too late</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {plan.lateTasks}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    task{plan.lateTasks === 1 ? "" : "s"}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-4">
            {plan.days.map((day) => (
              <Card key={day.key}>
                <CardHeader className="pb-3">
                  <DayHeader day={day} />
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {day.tasks.length > 0 ? (
                    day.tasks.map((slot) => (
                      <PlannedRow key={slot.task.id} slot={slot} />
                    ))
                  ) : (
                    <p className="py-2 text-center text-sm text-muted-foreground">
                      Free day — no tasks placed.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {plan.unassigned.length > 0 ? (
            <Card className="mt-6 border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Inbox className="h-4 w-4 text-accent" />
                  Couldn&apos;t place this week
                </CardTitle>
                <CardDescription>
                  Real tasks that fit nowhere within {minutesLabel(budget)}{" "}
                  per day.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {unassignedBig.length > 0 ? (
                  <p className="mb-1 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
                    {unassignedBig.length} task
                    {unassignedBig.length === 1 ? "" : "s"} estimate more than
                    the whole daily budget — raise it above or split them
                    manually.
                  </p>
                ) : null}
                {plan.unassigned.map((task) => (
                  <PlannedRow
                    key={task.id}
                    slot={{
                      task,
                      dayOffset: -1,
                      overdue: false,
                      late: false,
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          ) : null}
        </>
      )}

      <p className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
        <InfoNote />
        This plan is <span className="font-medium text-foreground">advisory</span>{" "}
        — it shows where your real tasks fit, but it never changes them. Each
        row opens the task so you confirm or adjust the plan yourself. No due
        dates are moved, no calendar events are created (spec 37).
      </p>
    </div>
  );
}

function InfoNote() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}