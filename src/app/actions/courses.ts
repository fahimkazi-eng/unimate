"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/* ---------- Schemas ---------- */

const emptyToNull = (value: unknown) => (value === "" ? null : value);

const courseFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(80, "Keep names under 80 characters."),
  code: z.preprocess(
    emptyToNull,
    z.string().trim().max(20, "Keep codes short.").nullable()
  ),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color."),
});

const courseIdSchema = z.uuid();

/* ---------- Types ---------- */

export type CourseState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;

/* ---------- Helpers ---------- */

/** Courses appear in the nav, the task forms' dropdown and the dashboard. */
function refreshCoursePages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/courses");
}

/* ---------- Actions ---------- */

export async function createCourse(
  _prevState: CourseState,
  formData: FormData
): Promise<CourseState> {
  const user = await requireUser();
  const validated = courseFieldsSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    color: formData.get("color"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, code, color } = validated.data;

  const supabase = await createClient();
  const { error } = await supabase.from("courses").insert({
    user_id: user.id,
    name,
    code,
    color,
  });

  if (error) {
    return { message: error.message };
  }

  refreshCoursePages();
  return { success: true };
}

export async function updateCourse(
  courseId: string,
  _prevState: CourseState,
  formData: FormData
): Promise<CourseState> {
  const user = await requireUser();
  const id = courseIdSchema.safeParse(courseId);
  if (!id.success) return { message: "Invalid course." };

  const validated = courseFieldsSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    color: formData.get("color"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, code, color } = validated.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({ name, code, color })
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    return { message: error.message };
  }

  refreshCoursePages();
  redirect("/dashboard/courses");
}

export async function deleteCourse(courseId: string, _formData: FormData) {
  const user = await requireUser();
  const id = courseIdSchema.safeParse(courseId);
  if (!id.success) return;

  const supabase = await createClient();
  // Tasks referencing this course keep their course_id set to NULL
  // thanks to `on delete set null` in the schema.
  await supabase
    .from("courses")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id);

  refreshCoursePages();
}