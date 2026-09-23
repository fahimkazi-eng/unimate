/**
 * Hand-written types mirroring supabase/v1_schema.sql.
 * When a Supabase CLI project is configured, these can be replaced by
 * `supabase gen types typescript` output — but for V1 this keeps things
 * self-contained and readable.
 */

export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Course {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  color: string;
  created_at: string;
}

export interface CourseInsert {
  user_id: string;
  name: string;
  code?: string | null;
  color?: string;
}

export interface Task {
  id: string;
  user_id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  estimated_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  user_id: string;
  course_id?: string | null;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  estimated_minutes?: number | null;
}

export interface StudySession {
  id: string;
  user_id: string;
  course_id: string | null;
  duration: number;
  started_at: string;
  completed_at: string | null;
}

export interface StudySessionInsert {
  user_id: string;
  course_id?: string | null;
  duration: number;
  started_at?: string;
  completed_at?: string | null;
}

export interface Profile {
  id: string;
  display_name: string | null;
  xp: number;
  level: number;
  streak: number;
  last_activity: string | null;
  created_at: string;
}

/* A task joined with its course, for lists that need the course name/color. */
export interface TaskWithCourse extends Task {
  course: Pick<Course, "id" | "name" | "color"> | null;
}