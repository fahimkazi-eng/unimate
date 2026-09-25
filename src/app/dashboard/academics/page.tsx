import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCourses, getTasks } from "@/lib/queries";
import { getGradebook } from "@/lib/gradebook";
import {
  computeGpa,
  formatGpa,
  GPA_SCALE_MAX,
  perCourseGpa,
  pointsForLetter,
} from "@/lib/grades";
import { formatDueLabel } from "@/lib/dates";
import { deleteGrade } from "@/app/actions/grades";
import { GradeForm } from "@/components/academics/grade-form";
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
  Award,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  GraduationCap,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Academics — UniMate",
};

export const dynamic = "force-dynamic";

function courseCode(course: { code: string | null; name: string }): string {
  return course.code ? `${course.code} · ${course.name}` : course.name;
}

export default async function AcademicsPage() {
  const user = await requireUser();

  const [courses, allTasks, gradebook] = await Promise.all([
    getCourses(user.id),
    getTasks(user.id),
    getGradebook(user.id),
  ]);

  const gpaReport = computeGpa(gradebook.grades);
  const gpaByCourse = perCourseGpa(gradebook.grades);

  // Course snapshot — real task status per course.
  const snapshot = courses.map((course) => {
    const owned = allTasks.filter((t) => t.course_id === course.id);
    const open = owned.filter((t) => t.status !== "completed");
    const nextDue = open
      .filter((t) => t.due_date)
      .sort(
        (a, b) =>
          new Date(a.due_date as string).getTime() -
          new Date(b.due_date as string).getTime()
      )[0];
    const done = owned.length - open.length;
    return {
      course,
      openCount: open.length,
      doneCount: done,
      nextDue: nextDue?.due_date ? formatDueLabel(nextDue.due_date) : null,
      gpa: gpaByCourse.get(course.id) ?? null,
    };
  });

  const gradebookMissing = Boolean(gradebook.error);

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Academics</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Your semester at a glance — grades you record yourself, performance
          derived from your real tasks, and honest status for the parts no data
          source exists for yet.
        </p>
      </header>

      {/* -------- Gradebook -------- */}
      <section className="mt-6" aria-labelledby="gradebook-heading">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h2 id="gradebook-heading" className="text-lg font-semibold text-foreground">
            Gradebook & GPA
          </h2>
        </div>

        <div className="mt-3 grid [&>*]:min-w-0 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-accent" />
                Cumulative GPA
              </CardTitle>
              <CardDescription>
                Credit-weighted, 4.0 scale
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gpaReport.gpa !== null ? (
                <>
                  <p className="text-3xl font-bold text-foreground">
                    {formatGpa(gpaReport.gpa)}
                    <span className="text-base font-normal text-muted-foreground">
                      {" "}/ {GPA_SCALE_MAX.toFixed(1)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {gpaReport.gradeCount} graded course
                    {gpaReport.gradeCount === 1 ? "" : "s"} ·{" "}
                    {gpaReport.totalCredits} credits
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {gradebookMissing
                    ? "Waiting for the v5 migration."
                    : "No grades recorded yet — add your first one."}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Add a grade</CardTitle>
              <CardDescription>
                Your own records — GPA is computed from what you enter, never
                inferred.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gradebookMissing ? (
                <div className="rounded-xl border border-dashed border-warning/50 bg-warning/10 px-4 py-4 text-sm text-warning">
                  The gradebook table isn&apos;t created yet — run{" "}
                  <code className="font-medium">supabase/v5_gradebook.sql</code>{" "}
                  in the Supabase SQL Editor (one-time, same as the v2/v3/v4
                  migrations).
                </div>
              ) : (
                <GradeForm courses={courses} />
              )}
            </CardContent>
          </Card>
        </div>

        {!gradebookMissing && gradebook.grades.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
            <ul className="divide-y divide-border">
              {gradebook.grades.map((grade) => {
                const points = pointsForLetter(grade.letter);
                const color = grade.course?.color ?? "var(--color-primary)";
                return (
                  <li key={grade.id}>
                    <form
                      action={deleteGrade.bind(null, grade.id)}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <span
                        className="h-9 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {grade.course
                            ? courseCode(grade.course)
                            : "Course removed"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {grade.credits} credits · {points.toFixed(1)}{" "}
                          grade points
                        </p>
                      </div>
                      <Badge
                        variant={points >= 3 ? "default" : points >= 2 ? "warning" : "danger"}
                        className="w-9 justify-center"
                      >
                        {grade.letter}
                      </Badge>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete grade for ${grade.course?.name ?? "course"}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </section>

      {/* -------- Course snapshot -------- */}
      <section className="mt-8" aria-labelledby="courses-heading">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 id="courses-heading" className="text-lg font-semibold text-foreground">
            Course snapshot
          </h2>
          <Link
            href="/dashboard/courses"
            className="ml-auto inline-flex items-center gap-1 text-sm text-accent hover:underline"
          >
            Manage courses <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {snapshot.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center text-sm text-muted-foreground">
            No courses yet —{" "}
            <Link href="/dashboard/courses" className="text-accent hover:underline">
              add one
            </Link>{" "}
            to see your snapshot.
          </div>
        ) : (
          <div className="mt-3 grid [&>*]:min-w-0 gap-4 sm:grid-cols-2">
            {snapshot.map(({ course, openCount, doneCount, nextDue, gpa }) => {
              const total = openCount + doneCount;
              const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
              return (
                <Card key={course.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-10 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: course.color }}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">
                          {course.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course.code ?? "No code"}
                        </p>
                      </div>
                      {gpa !== null ? (
                        <Badge variant={gpa >= 3 ? "default" : "warning"}>
                          GPA {formatGpa(gpa)}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {doneCount}/{total} done
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {doneCount} done
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {openCount} open
                      </span>
                      {nextDue ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1",
                            nextDue === "Overdue" && "text-danger"
                          )}
                        >
                          <CalendarClock className="h-3.5 w-3.5" /> next: {nextDue}
                        </span>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* -------- What's next (honest) -------- */}
      <section className="mt-8" aria-labelledby="next-heading">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          <h2 id="next-heading" className="text-lg font-semibold text-foreground">
            Coming soon
          </h2>
        </div>

        <div className="mt-3 grid [&>*]:min-w-0 gap-4 sm:grid-cols-2">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Attendance</CardTitle>
              <CardDescription>Needs a real data source</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                UniMate has no attendance records — we&apos;d never invent
                percentages for you. This lands when class schedules can be
                synced or imported (v2.1+).
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Exams</CardTitle>
              <CardDescription>Needs a real data source</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Exam dates and results have no official record in UniMate yet.
                Add an exam as a{" "}
                <Link href="/dashboard/tasks" className="text-accent hover:underline">
                  task
                </Link>{" "}
                with a due date in the meantime — the calendar and planner will
                keep it honest.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}