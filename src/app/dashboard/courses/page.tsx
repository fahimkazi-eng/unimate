import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteCourse } from "@/app/actions/courses";
import { requireUser } from "@/lib/auth";
import { AppNav } from "@/components/dashboard/app-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourseForm } from "@/components/courses/course-form";
import { getCourses, getTasks } from "@/lib/queries";

export const metadata = {
  title: "Courses — UniMate",
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const user = await requireUser();
  const [courses, tasks] = await Promise.all([
    getCourses(user.id),
    getTasks(user.id),
  ]);

  // Task count per course — cheap client-side grouping, no N+1 queries.
  const taskCounts = tasks.reduce<Record<string, number>>((counts, task) => {
    if (task.course_id) {
      counts[task.course_id] = (counts[task.course_id] ?? 0) + 1;
    }
    return counts;
  }, {});

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <AppNav />

      <header>
        <h1 className="text-2xl font-bold text-foreground">Your courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {courses.length} {courses.length === 1 ? "course" : "courses"}
        </p>
      </header>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Add a course
          </CardTitle>
          <CardDescription>
            Courses color-code your tasks and power the dropdown when adding
            tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm />
        </CardContent>
      </Card>

      {courses.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-surface px-4 py-12 text-center text-sm text-muted-foreground">
          No courses yet — add your first one above, then link tasks to it. 👆
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id} className="flex items-center gap-4 p-5">
              <span
                className="h-10 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: course.color }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {course.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {course.code ?? "No code"} · {taskCounts[course.id] ?? 0}{" "}
                  {taskCounts[course.id] === 1 ? "task" : "tasks"}
                </p>
              </div>

              <Link href={`/dashboard/courses/${course.id}/edit`}>
                <Button variant="ghost" size="sm" aria-label="Edit course">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>

              <form action={deleteCourse.bind(null, course.id)}>
                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  className="text-danger hover:text-danger"
                  aria-label="Delete course"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}