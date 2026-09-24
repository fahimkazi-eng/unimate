import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AcademicPulse } from "@/components/dashboard/academic-pulse";
import { AchievementsPreview } from "@/components/dashboard/achievements-preview";
import { AiAssistantPanel } from "@/components/dashboard/ai-assistant-panel";
import { CalendarPreview } from "@/components/dashboard/calendar-preview";
import { CoursesSnapshot, type CourseSnapshotCourse } from "@/components/dashboard/courses-snapshot";
import { DeadlinesPanel } from "@/components/dashboard/deadlines-panel";
import { EmergencyPreview } from "@/components/dashboard/emergency-preview";
import { GoalsPreview } from "@/components/dashboard/goals-preview";
import { Hero } from "@/components/dashboard/hero";
import { NextMoveWidget } from "@/components/dashboard/next-move";
import { PlannerPreview } from "@/components/dashboard/planner-preview";
import { ProgressPreview } from "@/components/dashboard/progress-preview";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TodayTimeline } from "@/components/dashboard/today-timeline";
import { daysUntil, formatRelative, startOfDay } from "@/lib/dates";
import { buildHeroHeadline, greetingForHour } from "@/lib/dashboard-hero";
import { computeGpa } from "@/lib/grades";
import { pickNextMove } from "@/lib/next-move";
import { planWeek } from "@/lib/planner";
import { dayKey } from "@/lib/calendar";
import { detectCrisis } from "@/lib/emergency";
import { getAchievements } from "@/lib/achievements";
import { getGoals } from "@/lib/goals";
import { getGradebook } from "@/lib/gradebook";
import {
  getCourseProgress,
  getCourses,
  getOrCreateProfile,
  getStudyStats,
  getTaskStats,
  getTasks,
  getWeeklyStudyByDay,
} from "@/lib/queries";

export const metadata = {
  title: "Dashboard — UniMate",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  const [
    profile,
    taskStats,
    courses,
    courseProgress,
    gradebook,
    allTasks,
    weekDays,
    studyStats,
    goalsReport,
    achievementsReport,
  ] = await Promise.all([
    getOrCreateProfile(user.id),
    getTaskStats(user.id),
    getCourses(user.id),
    getCourseProgress(user.id),
    getGradebook(user.id),
    getTasks(user.id),
    getWeeklyStudyByDay(user.id),
    getStudyStats(user.id),
    getGoals(user.id),
    getAchievements(user.id),
  ]);

  // Deadlines = open tasks with a due date, most urgent first. Derived from
  // the tasks we already fetched (Phase E perf) — one fewer round trip.
  const deadlines = allTasks
    .filter((t) => t.status !== "completed" && t.due_date)
    .sort(
      (a, b) =>
        new Date(a.due_date as string).getTime() -
        new Date(b.due_date as string).getTime()
    );

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

  // Emergency card — controlled: only urgent when a real crisis exists.
  const crisis = detectCrisis(allTasks, dayKey(now), now.toISOString());
  const openDatedTasks = allTasks.filter(
    (t) => t.status !== "completed" && t.due_date
  ).length;

  // AI section — the key never leaves the server; honest offline state.
  const aiConfigured = Boolean(process.env.ASSISTANT_API_KEY);

  return (
    <div className="mx-auto max-w-6xl">
      {/* One grid — mobile follows spec §29's reading order; lg: keeps the
          bento from §28. Order utilities re-flow the SAME sections. */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* 1 · Greeting */}
        <div className="order-1 h-full lg:order-1 lg:col-span-5">
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
        </div>

        {/* 2 mobile · 3 desktop — next move */}
        <div className="order-2 h-full lg:order-3 lg:col-span-3">
          <NextMoveWidget task={nextMove} />
        </div>

        {/* 3 mobile · 2 desktop — quick actions */}
        <div className="order-3 h-full lg:order-2 lg:col-span-5">
          <QuickActions />
        </div>

        {/* 4 · today */}
        <div className="order-4 h-full lg:order-4 lg:col-span-2">
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

        {/* 5 · deadlines */}
        <div className="order-5 h-full lg:order-5 lg:col-span-2">
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

        {/* 6 mobile · 12 desktop — AI study assistant */}
        <div className="order-6 h-full lg:order-12 lg:col-span-5">
          <AiAssistantPanel aiConfigured={aiConfigured} />
        </div>

        {/* 7 mobile · 6 desktop — courses */}
        <div className="order-7 h-full lg:order-6 lg:col-span-3">
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

        {/* 8 mobile · 7 desktop — academic pulse */}
        <div className="order-8 h-full lg:order-7 lg:col-span-3">
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

        {/* 9 mobile · 8 desktop — calendar */}
        <div className="order-9 h-full lg:order-8 lg:col-span-2">
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

        {/* 10 mobile · 9 desktop — smart planner */}
        <div className="order-10 h-full lg:order-9 lg:col-span-5">
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

        {/* 11 mobile · 10 desktop — progress */}
        <div className="order-11 h-full lg:order-10 lg:col-span-3">
          <Card className="h-full">
            <CardContent className="py-5">
              <ProgressPreview
                days={weekDays}
                weekMinutes={studyStats.minutes}
                weekSessions={studyStats.sessions}
                tasksCompleted={taskStats.completed}
                tasksTotal={taskStats.total}
                streak={profile?.streak ?? 0}
                xp={profile?.xp ?? 0}
                level={profile?.level ?? 1}
              />
            </CardContent>
          </Card>
        </div>

        {/* 12 mobile · 11 desktop — goals */}
        <div className="order-12 h-full lg:order-11 lg:col-span-2">
          <Card className="h-full">
            <CardContent className="py-5">
              <GoalsPreview
                goals={goalsReport.goals}
                error={goalsReport.error}
              />
            </CardContent>
          </Card>
        </div>

        {/* 13 · achievements */}
        <div className="order-[13] h-full lg:order-[13] lg:col-span-2">
          <Card className="h-full">
            <CardContent className="py-5">
              <AchievementsPreview
                achievements={achievementsReport.achievements}
                unlockedCount={achievementsReport.unlockedCount}
                totalCount={achievementsReport.totalCount}
              />
            </CardContent>
          </Card>
        </div>

        {/* 14 · emergency */}
        <div className="order-[14] h-full lg:order-[14] lg:col-span-3">
          <Card className="h-full">
            <CardContent className="py-5">
              <EmergencyPreview
                crisis={crisis}
                openDatedTasks={openDatedTasks}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}