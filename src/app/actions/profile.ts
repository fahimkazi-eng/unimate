"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/* ---------- Types ---------- */

export type ProfileState =
  | { errors?: Record<string, string[]>; message?: string; note?: string }
  | undefined;

/* ---------- Schema ---------- */

const profileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .max(40, "Keep it under 40 characters.")
    .optional(),
  university: z
    .string()
    .trim()
    .max(80, "Keep it under 80 characters.")
    .optional(),
  department: z
    .string()
    .trim()
    .max(80, "Keep it under 80 characters.")
    .optional(),
  semester: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z
      .number()
      .int("Enter a whole number.")
      .min(1, "Pick a semester between 1 and 16.")
      .max(16, "Pick a semester between 1 and 16.")
      .optional()
  ),
  academic_year: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z
      .number()
      .int("Enter a whole year.")
      .min(2000, "Check the year.")
      .max(2100, "Check the year.")
      .optional()
  ),
});

/* ---------- Action ---------- */

/**
 * V2 Phase 3 (spec 28) — save the editable profile fields.
 *
 * Pre-migration safety (mirrors Checkpoint 9): READS tolerate missing columns
 * (SELECT * returns them as undefined), but WRITES fail with "could not find
 * column". So we probe the extended columns first. Until the v2/v4 migrations
 * are run, the nickname field falls back to the V1-safe `display_name`
 * column, and the academic fields are skipped with a friendly note — saving
 * a profile never breaks on the live database.
 */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const parsed = profileSchema.safeParse({
    nickname: formData.get("nickname"),
    university: formData.get("university"),
    department: formData.get("department"),
    semester: formData.get("semester"),
    academic_year: formData.get("academic_year"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "Session expired — log in again." };

  const { nickname, university, department, semester, academic_year } =
    parsed.data;

  // Probe whether the extended columns exist yet.
  const { error: probe } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();
  const extended = !probe;

  const patch: Record<string, unknown> = {};

  if (nickname !== undefined && nickname !== "") {
    // Post-v2: preferred short name. Pre-v2: safest real column.
    patch[extended ? "nickname" : "display_name"] = nickname;
  }

  let note: string | undefined;
  if (extended) {
    patch.university = university ?? null;
    patch.department = department ?? null;
    patch.semester = semester ?? null;
    patch.academic_year = academic_year ?? null;
  } else if (university || department || semester || academic_year) {
    note =
      "Academic fields unlock after the v4 migration — run supabase/v4_profile_fields.sql in the Supabase SQL Editor, then save again.";
  }

  // Nothing editable changed under the current migration level.
  if (Object.keys(patch).length === 0) {
    return { note: note ?? undefined };
  }

  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id);

  if (error) {
    return {
      message: extended
        ? "Couldn't save your profile — please try again."
        : "Couldn't save — run the v2 migration (supabase/v2_google_auth.sql) in Supabase, then save again.",
    };
  }

  return { message: "saved", note };
}