import {
  BookOpen,
  CalendarClock,
  Clock3,
  Flame,
  ListChecks,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { DeadlineList } from "@/components/dashboard/deadline-list";
import { NextMoveWidget } from "@/components/dashboard/next-move";
import { WeeklyChart } from "@/components/progress/weekly-chart";
import { Reveal } from "@/components/ui/reveal";
import { formatDueLabel } from "@/lib/dates";
import { staggerDelay } from "@/lib/motion";
import { pickNextMove } from "@/lib/next-move";
import {
  getCourses,
  getIncompleteDeadlines,
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

function greetingForHour(hour: number): string {
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [profile, deadlines, taskStats, studyStats, courses, weekly, allTasks] =
    await Promise.all([
      getOrCreateProfile(user.id),
      getIncompleteDeadlines(user.id),
      getTaskStats(user.id),
      getStudyStats(user.id),
      getCourses(user.id),
      getWeeklyStudyByDay(user.id),
      getTasks(user.id),
    ]);

  const name =
    profile?.display_name ??
    (user.user_metadata.full_name as string | undefined) ??
    "student";

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday.getTime() + 86_400_000);

  const overdue = deadlines.filter(
    (t) => t.due_date && new Date(t.due_date) < startOfToday
  );
  const dueToday = deadlines.filter(
    (t) =>
      t.due_date &&
      new Date(t.due_date) >= startOfToday &&
      new Date(t.due_date) < endOfToday
  );
  const upcoming = deadlines.filter(
    (t) => t.due_date && new Date(t.due_date) >= endOfToday
  );

  const nextDeadline = deadlines[0] ?? null;
  const progress =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  const nextMove = pickNextMove(allTasks);
  const streakBadge: BadgeVariant =
    (profile?.streak ?? 0) > 0 ? "warning" : "outline";

  const stats = [
    {
      icon: CalendarClock,
      label: "Next deadline",
      value: nextDeadline?.due_date
        ? formatDueLabel(nextDeadline.due_date)
        : "—",
      hint: nextDeadline?.title ?? "No deadlines yet",
    },
    {
      icon: ListChecks,
      label: "Due today",
      value: String(overdue.length + dueToday.length),
      hint: overdue.length > 0 ? `${overdue.length} overdue` : "No overdue tasks",
    },
    {
      icon: BookOpen,
      label: "Courses",
      value: String(courses.length),
      hint:
        courses.length === 1
          ? "1 course this term"
          : `${courses.length} courses this term`,
    },
    {
      icon: TrendingUp,
      label: "Progress",
      value: `${progress}%`,
      hint: `${taskStats.completed}/${taskStats.total} tasks complete`,
    },
    {
      icon: Clock3,
      label: "Studied this week",
      value: `${studyStats.minutes}m`,
      hint: `${studyStats.sessions} focus ${
        studyStats.sessions === 1 ? "session" : "sessions"
      }`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {greetingForHour(now.getHours())}, {name} 👋
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant={streakBadge}>
                <Flame className="h-3 w-3" />
                {profile?.streak ?? 0} day streak
              </Badge>
              <Badge variant="default">
                <Trophy className="h-3 w-3" />
                Level {profile?.level ?? 1}
              </Badge>
              <Badge variant="outline">{profile?.xp ?? 0} XP</Badge>
            </div>
          </div>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s your semester at a glance.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="animate-rise-in"
            style={{ animationDelay: staggerDelay(i) }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div
          className="animate-rise-in lg:col-span-3"
          style={{ animationDelay: staggerDelay(5) }}
        >
          <NextMoveWidget task={nextMove} />
        </div>

        <div
          className="animate-rise-in lg:col-span-2"
          style={{ animationDelay: staggerDelay(6) }}
        >
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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
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