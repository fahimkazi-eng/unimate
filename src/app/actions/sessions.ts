"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { recordProgress } from "@/lib/gamification";
import { createClient } from "@/lib/supabase/server";

/* ---------- Schema ---------- */

const recordSessionSchema = z.object({
  durationMinutes: z
    .number()
    .int("Whole minutes only.")
    .min(1, "At least 1 minute.")
    .max(24 * 60, "Max 24 hours."),
  courseId: z.string().uuid().nullable(),
  startedAt: z.string().datetime(),
});

/* ---------- Types ---------- */

export type RecordSessionResult =
  | { ok: true }
  | { ok: false; error: string };

/* ---------- Action ---------- */

/**
 * Records a completed focus session. Called by the client timer when a
 * session finishes (countdown hits zero or the user finishes early).
 */
export async function recordFocusSession(input: {
  durationMinutes: number;
  courseId: string | null;
  startedAt: string;
}): Promise<RecordSessionResult> {
  const user = await requireUser();
  const validated = recordSessionSchema.safeParse(input);

  if (!validated.success) {
    return { ok: false, error: "Session data is invalid." };
  }

  const { durationMinutes, courseId, startedAt } = validated.data;

  const supabase = await createClient();
  const { error } = await supabase.from("study_sessions").insert({
    user_id: user.id,
    course_id: courseId,
    duration: durationMinutes,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // Focus time earns XP (1 per minute) and feeds the streak.
  await recordProgress(user.id, durationMinutes);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/focus");
  revalidatePath("/dashboard/progress");
  return { ok: true };
}