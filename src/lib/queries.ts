import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  Course,
  Profile,
  StudySessionWithCourse,
  TaskWithCourse,
} from "@/lib/database.types";

/**
 * Data access for the dashboard — Phase 5.
 * Every function is scoped to the caller's user_id, and RLS enforces the
 * same boundary at the database level (defense in depth).
 */

const taskWithCourseSelect = "*, course:courses(id, name, color)";

/**
 * Profile row, created lazily if the signup trigger predates the table.
 * Wrapped in React `cache()` (Phase E perf pass): the dashboard layout, the
 * page, and the goals/achievements reports all ask for the same row every
 * request — this collapses them into ONE query per render pass.
 */
export const getOrCreateProfile = cache(
  async (userId: string): Promise<Profile | null> => {
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
      // Two requests can race to create the same profile row — the loser gets
      // a duplicate-key error even though the row now exists. Re-read before
      // giving up.
      const { data: retry } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (retry) return retry;

      console.error(
        "Profile row missing and couldn't be created. If this account predates the signup trigger, run the 'Users create own profile' INSERT policy from supabase/v1_schema.sql in the SQL Editor.",
        error.message
      );
      return null;
    }
    return data;
  }
);

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

/** Tasks with a due date (any status), soonest first — for the calendar. */
export async function getDatedTasks(
  userId: string
): Promise<TaskWithCourse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(taskWithCourseSelect)
    .eq("user_id", userId)
    .not("due_date", "is", null)
    .order("due_date", { ascending: true })
    .limit(200);

  if (error) {
    console.error("Failed to load dated tasks:", error.message);
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

/** Most recent completed focus sessions, newest first (for the focus page). */
export async function getRecentSessions(
  userId: string,
  limit = 5
): Promise<StudySessionWithCourse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("study_sessions")
    .select("*, course:courses(id, name, color)")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to load recent sessions:", error.message);
    return [];
  }
  return (data ?? []) as StudySessionWithCourse[];
}

/* ---------- Progress ---------- */

export interface StudyDay {
  date: string; // yyyy-mm-dd (local)
  label: string; // weekday, e.g. "Mon"
  minutes: number;
  isToday: boolean;
}

function localDateString(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Focus minutes per day for the last 7 days (oldest → today). */
export async function getWeeklyStudyByDay(userId: string): Promise<StudyDay[]> {
  const supabase = await createClient();

  const sixDaysAgo = new Date(new Date(Date.now() - 6 * 86_400_000));
  sixDaysAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("study_sessions")
    .select("started_at, duration")
    .eq("user_id", userId)
    .gte("started_at", sixDaysAgo.toISOString())
    .not("completed_at", "is", null);

  const minutesByDay: Record<string, number> = {};
  for (const session of data ?? []) {
    const key = localDateString(session.started_at);
    minutesByDay[key] = (minutesByDay[key] ?? 0) + session.duration;
  }

  if (error) {
    console.error("Failed to load weekly study data:", error.message);
  }

  const days: StudyDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86_400_000);
    const key = toDateString(date);
    const isToday = i === 0;
    days.push({
      date: key,
      label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(
        new Date(key + "T12:00:00")
      ),
      minutes: minutesByDay[key] ?? 0,
      isToday,
    });
  }

  return days;
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export interface CourseProgress {
  id: string;
  name: string;
  color: string;
  total: number;
  completed: number;
}

/** Completion per course (only courses that have at least one task). */
export async function getCourseProgress(userId: string): Promise<CourseProgress[]> {
  const [courses, tasks] = await Promise.all([
    getCourses(userId),
    getTasks(userId),
  ]);

  return courses
    .map((course) => {
      const courseTasks = tasks.filter((t) => t.course_id === course.id);
      return {
        id: course.id,
        name: course.name,
        color: course.color,
        total: courseTasks.length,
        completed: courseTasks.filter((t) => t.status === "completed").length,
      };
    })
    .filter((course) => course.total > 0);
}