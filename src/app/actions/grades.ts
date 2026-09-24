"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LETTER_GRADES, type LetterGrade } from "@/lib/grades";

/* ---------- Schemas ---------- */

const gradeSchema = z.object({
  course_id: z.uuid("Pick a course."),
  letter: z.enum(LETTER_GRADES as [LetterGrade, ...LetterGrade[]]),
  credits: z.coerce
    .number()
    .min(1, "Credits must be at least 1.")
    .max(20, "Keep credits under 20."),
});

const gradeIdSchema = z.uuid();

/* ---------- Types ---------- */

export type GradeState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

/* ---------- Helpers ---------- */

function refreshAcademicPages() {
  revalidatePath("/dashboard/academics");
  revalidatePath("/dashboard");
}

/* ---------- Actions ---------- */

export async function addGrade(
  _prevState: GradeState,
  formData: FormData
): Promise<GradeState> {
  const user = await requireUser();
  const validated = gradeSchema.safeParse({
    course_id: formData.get("course_id"),
    letter: formData.get("letter"),
    credits: formData.get("credits"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { course_id, letter, credits } = validated.data;

  const supabase = await createClient();
  const { error } = await supabase.from("grades").upsert(
    {
      user_id: user.id,
      course_id,
      letter,
      credits,
    },
    { onConflict: "user_id,course_id" }
  );

  if (error) {
    // PGRST204 — the table doesn't exist yet (v5 migration not run).
    if (error.code === "PGRST204") {
      return {
        message:
          "The gradebook isn't set up on this project yet — run supabase/v5_gradebook.sql in the Supabase SQL Editor (one-time).",
      };
    }
    return { message: error.message };
  }

  refreshAcademicPages();
  return { success: true };
}

export async function deleteGrade(gradeId: string, _formData: FormData) {
  const user = await requireUser();
  const id = gradeIdSchema.safeParse(gradeId);
  if (!id.success) return;

  const supabase = await createClient();
  await supabase
    .from("grades")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id);

  refreshAcademicPages();
}