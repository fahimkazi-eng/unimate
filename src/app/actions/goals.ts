"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { GOAL_MEASURES, type GoalMeasure } from "@/lib/goal-meta";

/* ---------- Schemas ---------- */

const goalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give your goal a name.")
    .max(80, "Keep it under 80 characters."),
  measure: z.enum(GOAL_MEASURES as [GoalMeasure, ...GoalMeasure[]]),
  target: z.coerce
    .number()
    .int("Target must be a whole number.")
    .min(1, "Target must be at least 1.")
    .max(100_000, "Keep targets under 100,000."),
});

const goalIdSchema = z.uuid();

/* ---------- Types ---------- */

export type GoalState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

/* ---------- Helpers ---------- */

function refreshGoalPages() {
  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
}

/* ---------- Actions ---------- */

export async function createGoal(
  _prevState: GoalState,
  formData: FormData
): Promise<GoalState> {
  const user = await requireUser();
  const validated = goalSchema.safeParse({
    title: formData.get("title"),
    measure: formData.get("measure"),
    target: formData.get("target"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { title, measure, target } = validated.data;

  const supabase = await createClient();
  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title,
    measure,
    target,
  });

  if (error) {
    return { message: error.message };
  }

  refreshGoalPages();
  return { success: true };
}

export async function deleteGoal(goalId: string, _formData: FormData) {
  const user = await requireUser();
  const id = goalIdSchema.safeParse(goalId);
  if (!id.success) return;

  const supabase = await createClient();
  await supabase
    .from("goals")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id);

  refreshGoalPages();
}