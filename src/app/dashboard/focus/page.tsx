import { requireUser } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FocusTimer } from "@/components/focus/focus-timer";
import { RecentSessions } from "@/components/focus/recent-sessions";
import { getCourses, getRecentSessions } from "@/lib/queries";

export const metadata = {
  title: "Focus — UniMate",
};

export const dynamic = "force-dynamic";

export default async function FocusPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const [courses, sessions] = await Promise.all([
    getCourses(user.id),
    getRecentSessions(user.id),
  ]);

  // "Start focus" deep-link: ?course=<id> preselects that course, but only
  // when the id actually belongs to this user's courses.
  const { course: courseParam } = await searchParams;
  const initialCourseId =
    typeof courseParam === "string" && courses.some((c) => c.id === courseParam)
      ? courseParam
      : undefined;

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Focus timer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a course, press start, and get into the zone.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>
              Finished sessions are saved to your study stats automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FocusTimer courses={courses} initialCourseId={initialCourseId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent sessions</CardTitle>
            <CardDescription>Your latest focus wins.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSessions sessions={sessions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}