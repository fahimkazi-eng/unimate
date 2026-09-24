import { CheckCircle2, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { getCourses, getTasks } from "@/lib/queries";

export const metadata = {
  title: "Tasks — UniMate",
};

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ due?: string | string[] }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const due =
    typeof params.due === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.due)
      ? params.due
      : undefined;

  const [tasks, courses] = await Promise.all([
    getTasks(user.id),
    getCourses(user.id),
  ]);

  const active = tasks.filter((task) => task.status !== "completed");
  const completed = tasks.filter((task) => task.status === "completed");

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Your tasks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {active.length} active · {completed.length} completed
        </p>
      </header>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Add a task
          </CardTitle>
          <CardDescription>
            Give it a title, pick a course, set a deadline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm courses={courses} defaultDue={due} />
        </CardContent>
      </Card>

      {tasks.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-surface px-4 py-12 text-center text-sm text-muted-foreground">
          No tasks yet — add your first one above 👆
        </div>
      ) : (
        <>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Active</CardTitle>
              <CardDescription>Everything still on your plate.</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList
                tasks={active}
                emptyLabel="All clear — nothing active. 🎉"
              />
            </CardContent>
          </Card>

          {completed.length > 0 ? (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList tasks={completed} emptyLabel="Nothing completed yet." />
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}