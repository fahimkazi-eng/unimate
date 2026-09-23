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
import { CourseForm } from "@/components/courses/course-form";
import { getCourse } from "@/lib/queries";

export const metadata = {
  title: "Edit course — Campus Hub",
};

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const course = await getCourse(user.id, id);
  if (!course) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <AppNav />
      <Card>
        <CardHeader>
          <CardTitle>Edit course</CardTitle>
          <CardDescription>Update the details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm course={course} />
        </CardContent>
      </Card>
    </main>
  );
}