import { requireUser } from "@/lib/auth";
import {
  getCourses,
  getOrCreateProfile,
  getStudyStats,
  getTasks,
} from "@/lib/queries";
import { pickNextMove } from "@/lib/next-move";
import { levelFromXp } from "@/lib/gamification";
import { formatShort } from "@/lib/dates";
import { NextMoveWidget } from "@/components/dashboard/next-move";
import { StudyAssistant } from "@/components/assistant/study-assistant";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flame, ListChecks, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Study Assistant — UniMate",
};

export const dynamic = "force-dynamic";

function minutesLabel(minutes: number): string {
  if (minutes <= 0) return "No estimate";
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}

export default async function AssistantPage() {
  const user = await requireUser();

  const [profile, allTasks, courses, stats] = await Promise.all([
    getOrCreateProfile(user.id),
    getTasks(user.id),
    getCourses(user.id),
    getStudyStats(user.id),
  ]);

  const nextMove = pickNextMove(allTasks);

  // Week load — tasks due in the next 7 days (starting today at 00:00 local).
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86_400_000);
  const weekTasks = allTasks.filter((t) => {
    if (t.status === "completed" || !t.due_date) return false;
    const due = new Date(t.due_date).getTime();
    return due >= weekStart.getTime() && due < weekEnd.getTime();
  });
  const weekMinutes = weekTasks.reduce(
    (sum, t) => sum + (t.estimated_minutes ?? 0),
    0
  );

  // Course watch — the course with the most open tasks.
  const openByCourse = courses.map((course) => {
    const open = allTasks.filter(
      (t) => t.course_id === course.id && t.status !== "completed"
    );
    const nextDue = open
      .filter((t) => t.due_date)
      .sort(
        (a, b) =>
          new Date(a.due_date as string).getTime() -
          new Date(b.due_date as string).getTime()
      )[0];
    return { course, open: open.length, nextDue };
  });
  const watched =
    openByCourse.filter((c) => c.open > 0).sort((a, b) => b.open - a.open)[0] ??
    null;

  const streak = profile?.streak ?? 0;
  const xp = profile?.xp ?? 0;
  const level = levelFromXp(xp);
  const aiConfigured = Boolean(process.env.ASSISTANT_API_KEY);

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Study Assistant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Smart cards computed from your real data — plus a Study Coach chat
          that gets personal when a server-side AI key is configured.
        </p>
      </header>

      <div className="mt-6 grid [&>*]:min-w-0 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <NextMoveWidget task={nextMove} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-accent" />
              Week load
            </CardTitle>
            <CardDescription>Next 7 days, from real due dates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {weekTasks.length}{" "}
              <span className="text-base font-normal text-muted-foreground">
                task{weekTasks.length === 1 ? "" : "s"} due
              </span>
            </p>
            {weekTasks.length > 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {minutesLabel(weekMinutes)} of estimated work —{" "}
                {weekTasks.length <= 3
                  ? "an easy cadence."
                  : weekTasks.length <= 6
                    ? "a steady week."
                    : "a heavy stretch — plan ahead."}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Nothing due this week. A good window to get ahead.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-accent" />
              Course watch
            </CardTitle>
            <CardDescription>Where attention is needed most</CardDescription>
          </CardHeader>
          <CardContent>
            {watched ? (
              <>
                <p className="text-2xl font-bold text-foreground">
                  {watched.course.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {watched.open} open task{watched.open === 1 ? "" : "s"}
                  {watched.nextDue
                    ? ` — next due ${formatShort(
                        watched.nextDue.due_date as string
                      )}`
                    : ""}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {courses.length === 0
                  ? "Add a course to start tracking."
                  : "All caught up — nothing open in any course."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-accent" />
              Your momentum
            </CardTitle>
            <CardDescription>Streak and level, from real focus time</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {streak}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  day{streak === 1 ? "" : "s"} streak
                </span>
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                Level {level}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  · {xp} XP
                </span>
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.minutes}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  min focused this week
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <StudyAssistant aiConfigured={aiConfigured} />
      </div>
    </div>
  );
}