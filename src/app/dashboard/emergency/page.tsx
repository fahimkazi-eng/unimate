import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCourses, getStudyStats, getTasks } from "@/lib/queries";
import {
  crunchLoad,
  deferrableList,
  detectCrisis,
  priorityTone,
  sprintEstimate,
} from "@/lib/emergency";
import { dayKey } from "@/lib/calendar";
import { DEFAULT_ESTIMATE_MINUTES } from "@/lib/planner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Coffee,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Emergency mode — UniMate",
};

export const dynamic = "force-dynamic";

export default async function EmergencyPage() {
  const user = await requireUser();
  const now = new Date();
  const todayKey = dayKey(now);

  const [tasks, courses, stats] = await Promise.all([
    getTasks(user.id),
    getCourses(user.id),
    getStudyStats(user.id),
  ]);

  const crisis = detectCrisis(tasks, todayKey, now.toISOString());
  const crunch = crunchLoad(tasks, todayKey);
  const deferrable = deferrableList(tasks);
  const courseOf = (id: string | null) =>
    id ? courses.find((c) => c.id === id) : undefined;

  const overdue = crisis?.kind === "overdue";
  const showHours = crisis ? Math.abs(crisis.daysLeft) === 0 : false;
  const bigNumber = crisis
    ? showHours
      ? Math.max(1, Math.round(Math.abs(crisis.hoursLeft)))
      : Math.abs(crisis.daysLeft)
    : 0;
  const bigLabel = crisis
    ? showHours
      ? overdue
        ? "hours overdue"
        : "hours left"
      : overdue
        ? `day${Math.abs(crisis.daysLeft) === 1 ? "" : "s"} overdue`
        : `day${crisis.daysLeft === 1 ? "" : "s"} left`
    : "";

  const sprints = sprintEstimate(crunch.minutes);
  const crisisCourse = crisis ? courseOf(crisis.task.course_id) : undefined;
  const focusHref = crisis?.task.course_id
    ? `/dashboard/focus?course=${crisis.task.course_id}`
    : "/dashboard/focus";

  const strip = [
    { label: "Overdue", value: crunch.overdueCount, danger: crunch.overdueCount > 0 },
    { label: "Due today", value: crunch.dueTodayCount, danger: crunch.dueTodayCount > 0 },
    { label: "Due this week", value: crunch.taskCount, danger: false },
    { label: "Load ahead", value: `~${crunch.minutes} min`, danger: false },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Siren className="h-6 w-6 text-danger" aria-hidden />
          Emergency mode
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          A calm screen for when time is short. Everything here is computed
          from your real tasks — nothing pre-filled, nothing guessed, and this
          mode never moves dates or schedules anything for you.
        </p>
      </header>

      {/* -------- The crisis -------- */}
      <section className="mt-6" aria-labelledby="crisis-heading">
        <h2 id="crisis-heading" className="sr-only">
          Current crisis
        </h2>

        {crisis ? (
          <Card
            className={cn(
              "overflow-hidden",
              overdue ? "border-danger/40" : "border-warning/40"
            )}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Badge variant={overdue ? "danger" : "warning"}>
                  {overdue ? "Overdue" : "Countdown"}
                </Badge>
                <Badge variant={priorityTone(crisis.task.priority)}>
                  {crisis.task.priority} priority
                </Badge>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <span
                  className="mt-1 h-12 w-1.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      crisisCourse?.color ?? "var(--color-primary)",
                  }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <h3 className="text-xl font-bold leading-snug text-foreground">
                    {crisis.task.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {crisisCourse
                      ? crisisCourse.code
                        ? `${crisisCourse.code} · ${crisisCourse.name}`
                        : crisisCourse.name
                      : "No course"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-muted/50 px-5 py-4">
                <p
                  className={cn(
                    "text-5xl font-black tracking-tight",
                    overdue ? "text-danger" : "text-foreground"
                  )}
                >
                  {bigNumber}
                  <span className="ml-2 text-lg font-semibold text-muted-foreground">
                    {bigLabel}
                  </span>
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {crisis.headline}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button href={focusHref} size="lg">
                  <Siren className="h-4 w-4" />
                  Start a focus session
                </Button>
                <Button
                  href={`/dashboard/tasks/${crisis.task.id}/edit`}
                  variant="outline"
                  size="lg"
                >
                  Open the task
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {crisisCourse ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Focus will preselect {crisisCourse.name} — the session saves
                  to your real study stats.
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center px-4 py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-success" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                Nothing&apos;s on fire right now.
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                When the nearest deadline gets within a week — or slips
                overdue — the crisis card appears here automatically. In the
                meantime, the load below is your honest picture for the week
                ahead.
              </p>
            </CardContent>
          </Card>
        )}

        {/* -------- Load strip (real numbers) -------- */}
        <div className="mt-4 grid [&>*]:min-w-0 grid-cols-2 gap-4 sm:grid-cols-4">
          {strip.map((s) => (
            <Card key={s.label} className="border-border/60">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
                <p
                  className={cn(
                    "mt-1 text-2xl font-bold",
                    s.danger ? "text-danger" : "text-foreground"
                  )}
                >
                  {s.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* -------- The honest math -------- */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            The honest math
          </CardTitle>
          <CardDescription>
            Real tasks vs. your real focus pace — no schedule assumptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid [&>*]:min-w-0 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-sm text-muted-foreground">Load ahead</p>
            <p className="mt-1 text-xl font-bold text-foreground">
              ~{crunch.minutes} min
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              across {crunch.taskCount} open task
              {crunch.taskCount === 1 ? "" : "s"} (overdue + due this week)
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-sm text-muted-foreground">Your focus this week</p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {stats.minutes} min
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.sessions} finished session{stats.sessions === 1 ? "" : "s"}{" "}
              — logged, not promised
            </p>
          </div>
          <p className="text-sm text-muted-foreground sm:col-span-2">
            {sprints > 0 ? (
              <>
                At a {DEFAULT_ESTIMATE_MINUTES}-minute sprint pace that&apos;s
                roughly <span className="font-medium text-foreground">{sprints}</span>{" "}
                focused sprints. Estimates are yours — a task without one is
                counted as {DEFAULT_ESTIMATE_MINUTES} min, the same assumption
                the planner states.
              </>
            ) : (
              "Nothing urgent is due this week — your load is clear or unmeasured."
            )}
          </p>
        </CardContent>
      </Card>

      {/* -------- What can wait (advisory) -------- */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-4 w-4 text-primary" />
            What can wait
          </CardTitle>
          <CardDescription>
            Low-priority tasks with no deadline — the safest to postpone when
            time is short. Nothing here is moved for you; it&apos;s your call.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deferrable.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing fits this list right now — every open task is either
              prioritised or has a date, so it&apos;s all on the clock.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {deferrable.map((t) => {
                const course = courseOf(t.course_id);
                return (
                  <li key={t.id}>
                    <Link
                      href={`/dashboard/tasks/${t.id}/edit`}
                      className="group flex items-center gap-3 py-3"
                    >
                      <span
                        className="h-9 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            course?.color ?? "var(--color-muted-foreground)",
                        }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground group-hover:text-accent">
                          {t.title}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {course ? course.name : "No course"} · low priority ·
                          no deadline
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
        <ClipboardList className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Emergency mode is advisory by design: it never edits tasks, moves due
        dates, or schedules sessions on your behalf — exactly like the planner.
      </p>
    </div>
  );
}