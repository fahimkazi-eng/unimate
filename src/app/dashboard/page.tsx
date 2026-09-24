import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AcademicPulse } from "@/components/dashboard/academic-pulse";
import { CalendarPreview } from "@/components/dashboard/calendar-preview";
import { CoursesSnapshot, type CourseSnapshotCourse } from "@/components/dashboard/courses-snapshot";
import { DeadlinesPanel } from "@/components/dashboard/deadlines-panel";
import { Hero } from "@/components/dashboard/hero";
import { NextMoveWidget } from "@/components/dashboard/next-move";
import { PlannerPreview } from "@/components/dashboard/planner-preview";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TodayTimeline } from "@/components/dashboard/today-timeline";
import { daysUntil, formatRelative, startOfDay } from "@/lib/dates";
import { buildHeroHeadline, greetingForHour } from "@/lib/dashboard-hero";
import { computeGpa } from "@/lib/grades";
import { pickNextMove } from "@/lib/next-move";
import { planWeek } from "@/lib/planner";
import { dayKey } from "@/lib/calendar";
import { getGradebook } from "@/lib/gradebook";
import {
  getCourseProgress,
  getCourses,
  getIncompleteDeadlines,
  getOrCreateProfile,
  getTaskStats,
  getTasks,
} from "@/lib/queries";

export const metadata = {
  title: "Dashboard — UniMate",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  const [
    profile,
    deadlines,
    taskStats,
    courses,
    courseProgress,
    gradebook,
    allTasks,
  ] = await Promise.all([
    getOrCreateProfile(user.id),
    getIncompleteDeadlines(user.id),
    getTaskStats(user.id),
    getCourses(user.id),
    getCourseProgress(user.id),
    getGradebook(user.id),
    getTasks(user.id),
  ]);

  const name =
    profile?.nickname ??
    profile?.display_name ??
    (user.user_metadata.full_name as string | undefined) ??
    "student";

  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart.getTime() + 86_400_000);
  const dayAfterTomorrow = new Date(tomorrowStart.getTime() + 86_400_000);
  const weekEnd = new Date(todayStart.getTime() + 7 * 86_400_000);

  const overdue = deadlines.filter((t) => new Date(t.due_date ?? 0) < todayStart);
  const dueToday = deadlines.filter(
    (t) =>
      new Date(t.due_date ?? 0) >= todayStart &&
      new Date(t.due_date ?? 0) < tomorrowStart
  );
  const dueTomorrow = deadlines.filter(
    (t) =>
      new Date(t.due_date ?? 0) >= tomorrowStart &&
      new Date(t.due_date ?? 0) < dayAfterTomorrow
  );
  const dueThisWeek = deadlines.filter(
    (t) =>
      new Date(t.due_date ?? 0) >= dayAfterTomorrow &&
      new Date(t.due_date ?? 0) < weekEnd
  );

  const nextDeadline = deadlines[0] ?? null;
  const progress =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  const nextMove = pickNextMove(allTasks);
  const hasActivity = taskStats.total > 0;

  const hero = buildHeroHeadline({
    overdueCount: overdue.length,
    hasDueToday: dueToday.length > 0,
    nextDeadline: nextDeadline
      ? {
          title: nextDeadline.title,
          days: daysUntil(nextDeadline.due_date as string),
          relative: formatRelative(nextDeadline.due_date as string),
        }
      : null,
    hasActivity,
  });

  // Courses snapshot — real progress + next open deadline per course.
  const progressById = new Map(courseProgress.map((c) => [c.id, c]));
  const openTasks = allTasks.filter((t) => t.status !== "completed");
  const snapshotCourses: CourseSnapshotCourse[] = courses.map((course) => {
    const owned = openTasks.filter((t) => t.course_id === course.id && t.due_date);
    const next = owned.sort(
      (a, b) =>
        new Date(a.due_date as string).getTime() -
        new Date(b.due_date as string).getTime()
    )[0];
    return {
      id: course.id,
      name: course.name,
      color: course.color,
      total: progressById.get(course.id)?.total ?? 0,
      completed: progressById.get(course.id)?.completed ?? 0,
      nextDeadline: next
        ? {
            title: next.title,
            label: formatRelative(next.due_date as string),
          }
        : null,
    };
  });

  // Academic pulse — real GPA from the gradebook.
  const gpa = computeGpa(gradebook.grades);

  // Calendar preview + planner.
  const calendarWeek = deadlines.filter((t) => new Date(t.due_date ?? 0) < weekEnd);
  const plan = planWeek(allTasks, dayKey(now));

  return (
    <div className="mx-auto max-w-6xl">
      {/* Row 0 — command-center hero */}
      <Hero
        greeting={greetingForHour(now.getHours())}
        name={name}
        headline={hero.headline}
        subline={hero.subline}
        streak={profile?.streak ?? 0}
        level={profile?.level ?? 1}
        xp={profile?.xp ?? 0}
        taskProgress={progress}
        tasksDone={taskStats.completed}
        tasksTotal={taskStats.total}
      />

      {/* Row 1 — quick actions */}
      <div className="mt-4 sm:mt-6">
        <QuickActions />
      </div>

      {/* Row 2 — next move + today */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <NextMoveWidget task={nextMove} />
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Today</CardTitle>
              <CardDescription>What&apos;s actually on for today.</CardDescription>
            </CardHeader>
            <CardContent>
              <TodayTimeline tasks={[...overdue, ...dueToday]} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 3 — deadlines + courses */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="py-5">
              <DeadlinesPanel
                overdue={overdue}
                today={dueToday}
                tomorrow={dueTomorrow}
                thisWeek={dueThisWeek}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Your courses</CardTitle>
              <CardDescription>Live progress from your actual tasks.</CardDescription>
            </CardHeader>
            <CardContent>
              <CoursesSnapshot courses={snapshotCourses} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 4 — academic pulse + calendar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="py-5">
              <AcademicPulse
                gpa={gpa.gpa}
                gradeCount={gpa.gradeCount}
                totalCredits={gpa.totalCredits}
                nextDeadline={
                  nextDeadline
                    ? {
                        title: nextDeadline.title,
                        label: formatRelative(nextDeadline.due_date as string),
                      }
                    : null
                }
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="py-5">
              <CalendarPreview
                today={dueToday}
                tomorrow={dueTomorrow}
                weekCount={calendarWeek.length}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 5 — smart planner */}
      <div className="mt-6">
        <Card className="h-full">
          <CardContent className="py-5">
            <PlannerPreview
              days={plan.days}
              plannedCount={plan.plannedCount}
              plannedMinutes={plan.plannedMinutes}
              overloadDays={plan.overloadDays}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}