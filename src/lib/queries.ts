import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Course, Profile, TaskWithCourse } from "@/lib/database.types";

/**
 * Data access for the dashboard — Phase 5.
 * Every function is scoped to the caller's user_id, and RLS enforces the
 * same boundary at the database level (defense in depth).
 */

const taskWithCourseSelect = "*, course:courses(id, name, color)";

/** Profile row, created lazily if the signup trigger predates the table. */
export async function getOrCreateProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (existing) return existing;

  // Not found — create a default row (needs the profiles INSERT policy).
  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: userId })
    .select("*")
    .maybeSingle();

  if (error) {
    console.error(
      "Profile row missing and couldn't be created. If this account predates the signup trigger, run the 'Users create own profile' INSERT policy from supabase/v1_schema.sql in the SQL Editor.",
      error.message
    );
    return null;
  }
  return data;
}

/** Incomplete tasks that have a due date, most urgent first. */
export async function getIncompleteDeadlines(userId: string): Promise<TaskWithCourse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(taskWithCourseSelect)
    .eq("user_id", userId)
    .neq("status", "completed")
    .not("due_date", "is", null)
    .order("due_date", { ascending: true })
    .limit(20);

  if (error) {
    console.error("Failed to load deadlines:", error.message);
    return [];
  }
  return (data ?? []) as TaskWithCourse[];
}

/** All of a user's tasks with their course joined, newest first. */
export async function getTasks(userId: string): Promise<TaskWithCourse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(taskWithCourseSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load tasks:", error.message);
    return [];
  }
  return (data ?? []) as TaskWithCourse[];
}

/** A single task owned by the user, or null (e.g. wrong user / missing). */
export async function getTask(
  userId: string,
  taskId: string
): Promise<TaskWithCourse | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(taskWithCourseSelect)
    .eq("id", taskId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load task:", error.message);
    return null;
  }
  return (data as TaskWithCourse | null) ?? null;
}

/** The user's courses, sorted by name. */
export async function getCourses(userId: string): Promise<Course[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load courses:", error.message);
    return [];
  }
  return data ?? [];
}

/** A single course owned by the user, or null (wrong user / missing). */
export async function getCourse(
  userId: string,
  courseId: string
): Promise<Course | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load course:", error.message);
    return null;
  }
  return data ?? null;
}

/** Task completion counts used for the semester-progress figure. */
export async function getTaskStats(userId: string): Promise<{
  total: number;
  completed: number;
}> {
  const supabase = await createClient();

  const totalQuery = supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  const doneQuery = supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed");

  const [{ count: total }, { count: completed }] = await Promise.all([
    totalQuery,
    doneQuery,
  ]);

  return { total: total ?? 0, completed: completed ?? 0 };
}

export interface StudyStats {
  minutes: number;
  sessions: number;
}

/** Completed focus sessions recorded in the last 7 days. */
export async function getStudyStats(userId: string): Promise<StudyStats> {
  const supabase = await createClient();

  const weekAgo = new Date(Date.now() - 6 * 86_400_000);
  weekAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("study_sessions")
    .select("duration")
    .eq("user_id", userId)
    .gte("started_at", weekAgo.toISOString())
    .not("completed_at", "is", null);

  if (error) {
    console.error("Failed to load study stats:", error.message);
    return { minutes: 0, sessions: 0 };
  }

  const rows = data ?? [];
  return {
    sessions: rows.length,
    minutes: rows.reduce((sum, s) => sum + s.duration, 0),
  };
}