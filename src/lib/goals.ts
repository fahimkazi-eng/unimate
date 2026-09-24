import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/queries";
import type { GoalMeasure } from "@/lib/goal-meta";

/**
 * Checkpoint 11 — goals.
 *
 * A goal is a user-defined target ("Complete 50 tasks") whose progress is
 * measured against REAL all-time stats, computed fresh on every load — the
 * same derived-progress approach as achievements.
 */

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  measure: GoalMeasure;
  target: number;
  created_at: string;
}

export interface GoalWithProgress extends Goal {
  current: number;
  /** 0 → 1, clamped. */
  progress: number;
  complete: boolean;
}

export interface GoalsReport {
  goals: GoalWithProgress[];
  /** Table-missing (pre-migration) or network errors surface honestly. */
  error: string | null;
}

/** All goals with live progress, newest first. */
export async function getGoals(userId: string): Promise<GoalsReport> {
  const supabase = await createClient();

  const [profile, goals, taskStats, minutes, courseCount] = await Promise.all([
    getOrCreateProfile(userId),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("study_sessions")
      .select("duration")
      .eq("user_id", userId)
      .not("completed_at", "is", null),
    supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  if (goals.error) {
    return { goals: [], error: goals.error.message };
  }

  const metrics: Record<GoalMeasure, number> = {
    "tasks-completed": taskStats.count ?? 0,
    "focus-minutes": (minutes.data ?? []).reduce(
      (sum, row) => sum + (row.duration ?? 0),
      0
    ),
    courses: courseCount.count ?? 0,
    streak: profile?.streak ?? 0,
  };

  const withProgress: GoalWithProgress[] = (goals.data ?? []).map((goal) => {
    const current = metrics[goal.measure as GoalMeasure] ?? 0;
    const progress = Math.min(1, current / goal.target);
    return {
      ...goal,
      measure: goal.measure as GoalMeasure,
      current,
      progress,
      complete: progress >= 1,
    };
  });

  return { goals: withProgress, error: null };
}