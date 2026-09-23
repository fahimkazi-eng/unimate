import { Flame, ListChecks, Timer, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  levelFromXp,
  xpForNextLevel,
  xpIntoLevel,
} from "@/lib/gamification";
import {
  getCourseProgress,
  getOrCreateProfile,
  getStudyStats,
  getTaskStats,
  getWeeklyStudyByDay,
} from "@/lib/queries";
import { AppNav } from "@/components/dashboard/app-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeeklyChart } from "@/components/progress/weekly-chart";
import { CourseProgressList } from "@/components/progress/course-progress";

export const metadata = {
  title: "Progress — UniMate",
};

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await requireUser();

  const [profile, weekly, taskStats, studyStats, courses] = await Promise.all([
    getOrCreateProfile(user.id),
    getWeeklyStudyByDay(user.id),
    getTaskStats(user.id),
    getStudyStats(user.id),
    getCourseProgress(user.id),
  ]);

  const xp = profile?.xp ?? 0;
  const level = levelFromXp(xp);
  const intoLevel = xpIntoLevel(xp);
  const nextLevelXp = xpForNextLevel(level);
  const levelPct = Math.min(
    100,
    Math.round((intoLevel / nextLevelXp) * 100)
  );
  const streak = profile?.streak ?? 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <AppNav />

      <header>
        <h1 className="text-2xl font-bold text-foreground">Your progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every completed task and focus session earns XP.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Level card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Level {level}
            </CardTitle>
            <CardDescription>
              {xp} total XP · {intoLevel}/{nextLevelXp} to level {level + 1}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${levelPct}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={streak > 0 ? "warning" : "outline"}>
                <Flame className="h-3 w-3" />
                {streak} day streak
              </Badge>
              <Badge variant="default">
                <ListChecks className="h-3 w-3" />
                {taskStats.completed}/{taskStats.total} tasks done
              </Badge>
              <Badge variant="outline">
                <Timer className="h-3 w-3" />
                {studyStats.minutes}m this week
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Weekly chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Focus this week</CardTitle>
            <CardDescription>Minutes of focused study per day.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart days={weekly} />
          </CardContent>
        </Card>
      </div>

      {/* Course progress */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Completion rate per course.</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseProgressList courses={courses} />
        </CardContent>
      </Card>
    </main>
  );
}