import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AppNav } from "@/components/dashboard/app-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskForm } from "@/components/tasks/task-form";
import { getCourses, getTask } from "@/lib/queries";

export const metadata = {
  title: "Edit task — Campus Hub",
};

export const dynamic = "force-dynamic";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [task, courses] = await Promise.all([
    getTask(user.id, id),
    getCourses(user.id),
  ]);

  // RLS + query already guarantee ownership; this cleanly handles
  // bad UUIDs, deleted tasks, or someone else's task id.
  if (!task) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <AppNav />
      <Card>
        <CardHeader>
          <CardTitle>Edit task</CardTitle>
          <CardDescription>Update the details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm courses={courses} task={task} />
        </CardContent>
      </Card>
    </main>
  );
}