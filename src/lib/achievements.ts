import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/queries";
import { levelFromXp } from "@/lib/gamification";

/**
 * Checkpoint 10 — achievements.
 *
 * Every badge is DERIVED from the user's real data at render time (no
 * `achievements` table, nothing to keep in sync). Profiling: unlock state
 * can never go stale because it's computed fresh on every page load from
 * tasks, courses, study sessions and the profile row.
 */

export type AchievementMeasure =
  | "tasks-completed"
  | "courses"
  | "focus-sessions"
  | "long-session"
  | "streak"
  | "xp"
  | "level";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  measure: AchievementMeasure;
  target: number;
  /** Tailwind gradient stops for the unlocked medal ring (data, not hex). */
  accent: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-win",
    title: "First win",
    description: "Complete your very first task.",
    emoji: "🎯",
    measure: "tasks-completed",
    target: 1,
    accent: "from-indigo-500 to-purple-500",
  },
  {
    id: "task-tamer",
    title: "Task tamer",
    description: "Knock out 25 tasks.",
    emoji: "🧹",
    measure: "tasks-completed",
    target: 25,
    accent: "from-sky-500 to-indigo-500",
  },
  {
    id: "task-hero",
    title: "Task hero",
    description: "Complete 100 tasks — a true closer.",
    emoji: "🦸",
    measure: "tasks-completed",
    target: 100,
    accent: "from-amber-400 to-rose-500",
  },
  {
    id: "course-cartographer",
    title: "Course cartographer",
    description: "Add 4 courses to your map.",
    emoji: "🗺️",
    measure: "courses",
    target: 4,
    accent: "from-emerald-500 to-teal-400",
  },
  {
    id: "deep-focus",
    title: "Deep focus",
    description: "One uninterrupted 30-minute focus session.",
    emoji: "🧘",
    measure: "long-session",
    target: 1,
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    id: "focus-machine",
    title: "Focus machine",
    description: "Complete 10 focus sessions.",
    emoji: "⚡",
    measure: "focus-sessions",
    target: 10,
    accent: "from-amber-400 to-orange-500",
  },
  {
    id: "on-a-roll",
    title: "On a roll",
    description: "Keep a 3-day study streak alive.",
    emoji: "🔥",
    measure: "streak",
    target: 3,
    accent: "from-rose-500 to-orange-400",
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Hold a 14-day streak.",
    emoji: "🏆",
    measure: "streak",
    target: 14,
    accent: "from-emerald-500 to-lime-400",
  },
  {
    id: "centurion",
    title: "Centurion",
    description: "Earn 100 XP in total.",
    emoji: "💯",
    measure: "xp",
    target: 100,
    accent: "from-emerald-500 to-teal-400",
  },
  {
    id: "rising-star",
    title: "Rising star",
    description: "Reach level 5.",
    emoji: "⭐",
    measure: "level",
    target: 5,
    accent: "from-indigo-500 to-purple-500",
  },
  {
    id: "scholar",
    title: "Scholar",
    description: "Climb to level 10.",
    emoji: "🎓",
    measure: "level",
    target: 10,
    accent: "from-violet-500 to-fuchsia-500",
  },
];

export interface AchievementState extends Achievement {
  unlocked: boolean;
  /** Raw progress against the target (e.g. 14 % 100 tasks). */
  current: number;
  /** 0 → 1, clamped. */
  progress: number;
}

export interface AchievementsReport {
  achievements: AchievementState[];
  unlockedCount: number;
  totalCount: number;
  /** The closest locked badge, or null when everything is unlocked. */
  nextUp: AchievementState | null;
}

/** Everything one trajectory: count queries + the profile row. */
export async function getAchievements(
  userId: string
): Promise<AchievementsReport> {
  const supabase = await createClient();

  const [profile, taskStats, coursesCount, focusSessions, longSession] =
    await Promise.all([
      getOrCreateProfile(userId),
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "completed"),
      supabase
        .from("courses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("study_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .not("completed_at", "is", null),
      supabase
        .from("study_sessions")
        .select("duration")
        .eq("user_id", userId)
        .not("completed_at", "is", null)
        .gte("duration", 30)
        .limit(1),
    ]);

  const xp = profile?.xp ?? 0;
  const metrics: Record<AchievementMeasure, number> = {
    "tasks-completed": taskStats.count ?? 0,
    courses: coursesCount.count ?? 0,
    "focus-sessions": focusSessions.count ?? 0,
    "long-session": (longSession.data?.length ?? 0) > 0 ? 1 : 0,
    streak: profile?.streak ?? 0,
    xp,
    level: levelFromXp(xp),
  };

  const achievements: AchievementState[] = ACHIEVEMENTS.map((badge) => {
    const current = metrics[badge.measure];
    const unlocked = current >= badge.target;
    return {
      ...badge,
      unlocked,
      current,
      progress: Math.min(1, current / badge.target),
    };
  });

  const unlocked = achievements.filter((a) => a.unlocked);

  const nextUp =
    achievements
      .filter((a) => !a.unlocked)
      .sort(
        (a, b) =>
          b.progress - a.progress ||
          a.target - b.target ||
          a.title.localeCompare(b.title)
      )[0] ?? null;

  return {
    achievements,
    unlockedCount: unlocked.length,
    totalCount: achievements.length,
    nextUp,
  };
}