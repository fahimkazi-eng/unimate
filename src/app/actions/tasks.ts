"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/* ---------- Schemas ---------- */

const emptyToNull = (value: unknown) => (value === "" ? null : value);

const taskFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Keep titles under 120 characters."),
  description: z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .max(1000, "Keep descriptions under 1000 characters.")
      .nullable()
  ),
  course_id: z.preprocess(emptyToNull, z.uuid().nullable()),
  due_date: z.preprocess(
    emptyToNull,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date.")
      .nullable()
  ),
  priority: z.enum(["low", "medium", "high"]),
  estimated_minutes: z.preprocess(
    emptyToNull,
    z.coerce
      .number()
      .int("Whole minutes only.")
      .min(1, "At least 1 minute.")
      .max(1440, "Max 24 hours.")
      .nullable()
  ),
});

const taskIdSchema = z.uuid();

/* ---------- Types ---------- */

export type TaskState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;

/* ---------- Helpers ---------- */

/** "2026-09-30" (date input) → end-of-day ISO so the deadline reads correctly. */
function dueDateToIso(dueDate: string | null): string | null {
  return dueDate ? new Date(`${dueDate}T23:59:59.999`).toISOString() : null;
}

/** The dashboard and the tasks page both display task data. */
function refreshTaskPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
}

function parseTaskForm(formData: FormData) {
  return taskFieldsSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    course_id: formData.get("course_id"),
    due_date: formData.get("due_date"),
    priority: formData.get("priority"),
    estimated_minutes: formData.get("estimated_minutes"),
  });
}

/* ---------- Actions ---------- */

export async function createTask(
  _prevState: TaskState,
  formData: FormData
): Promise<TaskState> {
  const user = await requireUser();
  const validated = parseTaskForm(formData);

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const {
    title,
    description,
    course_id,
    due_date,
    priority,
    estimated_minutes,
  } = validated.data;

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title,
    description,
    course_id,
    due_date: dueDateToIso(due_date),
    priority,
    estimated_minutes,
  });

  if (error) {
    return { message: error.message };
  }

  refreshTaskPages();
  return { success: true };
}

export async function updateTask(
  taskId: string,
  _prevState: TaskState,
  formData: FormData
): Promise<TaskState> {
  const user = await requireUser();
  const id = taskIdSchema.safeParse(taskId);
  if (!id.success) return { message: "Invalid task." };

  const validated = parseTaskForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const {
    title,
    description,
    course_id,
    due_date,
    priority,
    estimated_minutes,
  } = validated.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      description,
      course_id,
      due_date: dueDateToIso(due_date),
      priority,
      estimated_minutes,
    })
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    return { message: error.message };
  }

  // updated_at is kept fresh by the DB trigger.
  refreshTaskPages();
  redirect("/dashboard/tasks");
}

export async function toggleTaskComplete(
  taskId: string,
  _formData: FormData
) {
  const user = await requireUser();
  const id = taskIdSchema.safeParse(taskId);
  if (!id.success) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("status")
    .eq("id", id.data)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return;

  await supabase
    .from("tasks")
    .update({ status: data.status === "completed" ? "todo" : "completed" })
    .eq("id", id.data)
    .eq("user_id", user.id);

  refreshTaskPages();
}

export async function deleteTask(taskId: string, _formData: FormData) {
  const user = await requireUser();
  const id = taskIdSchema.safeParse(taskId);
  if (!id.success) return;

  const supabase = await createClient();
  await supabase
    .from("tasks")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id);

  refreshTaskPages();
}