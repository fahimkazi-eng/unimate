import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeadlineList } from "@/components/dashboard/deadline-list";
import { Hero } from "@/components/dashboard/hero";
import { NextMoveWidget } from "@/components/dashboard/next-move";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { WeeklyChart } from "@/components/progress/weekly-chart";
import { Reveal } from "@/components/ui/reveal";
import { daysUntil, formatRelative, todayRange } from "@/lib/dates";
import { buildHeroHeadline, greetingForHour } from "@/lib/dashboard-hero";
import { pickNextMove } from "@/lib/next-move";
import {
  getIncompleteDeadlines,
  getOrCreateProfile,
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

  const [profile, deadlines, taskStats, weekly, allTasks] = await Promise.all([
    getOrCreateProfile(user.id),
    getIncompleteDeadlines(user.id),
    getTaskStats(user.id),
    getWeeklyStudyByDay(user.id),
    getTasks(user.id),
  ]);

  const name =
    profile?.nickname ??
    profile?.display_name ??
    (user.user_metadata.full_name as string | undefined) ??
    "student";

  const now = new Date();
  const { start: startOfToday, end: endOfToday } = todayRange();

  const overdue = deadlines.filter((t) => new Date(t.due_date ?? 0) < startOfToday);
  const dueToday = deadlines.filter(
    (t) =>
      new Date(t.due_date ?? 0) >= startOfToday &&
      new Date(t.due_date ?? 0) < endOfToday
  );
  const upcoming = deadlines.filter((t) => new Date(t.due_date ?? 0) >= endOfToday);

  const nextDeadline = upcoming[0] ?? null;
  const progress =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  const nextMove = pickNextMove(allTasks);
  const hasActivity =
    taskStats.total > 0 || weekly.some((day) => day.minutes > 0);

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

  return (
    <div className="mx-auto max-w-6xl">
      {/* Command-center hero: greeting + adaptive headline + stat cluster */}
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

      {/* Quick-action command bar */}
      <div className="mt-4 sm:mt-6">
        <QuickActions />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <NextMoveWidget task={nextMove} />
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Today&apos;s focus</CardTitle>
              <CardDescription>Overdue and due-today tasks, most urgent first.</CardDescription>
            </CardHeader>
            <CardContent>
              <DeadlineList
                tasks={[...overdue, ...dueToday]}
                empty="Nothing due today 🎉"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Card>
            <CardHeader>
              <CardTitle>Weekly activity</CardTitle>
              <CardDescription>Focus minutes, last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyChart days={weekly} />
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming deadlines</CardTitle>
              <CardDescription>The next tasks on your horizon.</CardDescription>
            </CardHeader>
            <CardContent>
              <DeadlineList
                tasks={upcoming.slice(0, 4)}
                empty="No upcoming deadlines — enjoy the calm."
              />
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}