import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * V2 Phase 7 — gradebook data access.
 * Same pattern as goals (C11): reads tolerate a missing table (pre-migration)
 * and surface the error honestly instead of crashing.
 */

export interface Grade {
  id: string;
  user_id: string;
  course_id: string;
  letter: string;
  credits: number;
  created_at: string;
  course: { id: string; name: string; code: string | null; color: string } | null;
}

export interface GradebookReport {
  grades: Grade[];
  /** Table-missing (pre-migration) or network errors surface honestly. */
  error: string | null;
}

/** All of the user's grades (newest course first), joined with the course. */
export async function getGradebook(userId: string): Promise<GradebookReport> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grades")
    .select("*, course:courses(id, name, code, color)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { grades: [], error: error.message };
  }

  const grades = (data ?? []) as unknown as Grade[];
  // Newest first, then alphabetically by course name for stable rows.
  grades.sort((a, b) =>
    (a.course?.name ?? "").localeCompare(b.course?.name ?? "")
  );

  return { grades, error: null };
}