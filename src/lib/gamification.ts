import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Gamification helpers — XP, levels and streaks.
 *
 * Keep the math here so every screen (dashboard, progress page) computes
 * levels the same way, and every action (task done, session finished)
 * awards XP through one entry point.
 */

/** Level curve: level 1 at 0 XP, level 2 at 100 XP, level 3 at 400 XP… */
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/** XP already earned inside the current level. */
export function xpIntoLevel(xp: number): number {
  const level = levelFromXp(xp);
  return xp - 100 * (level - 1) ** 2;
}

/** Total XP needed to advance from the given level to the next one. */
export function xpForNextLevel(level: number): number {
  return 100 * (2 * level - 1);
}

/* ---------- Database writes ---------- */

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function todayString(): string {
  return toDateString(new Date());
}

function yesterdayString(): string {
  return toDateString(new Date(Date.now() - 86_400_000));
}

/** Adds XP and recomputes the level. No-op if the profile row is missing. */
async function awardXp(userId: string, amount: number) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return;

  const xp = profile.xp + amount;
  await supabase
    .from("profiles")
    .update({ xp, level: levelFromXp(xp) })
    .eq("id", userId);
}

/**
 * Updates the streak: consecutive days with activity grow it,
 * a gap resets it to 1, same-day activity leaves it unchanged.
 */
async function updateStreak(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak, last_activity")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return;

  const today = todayString();
  const last = profile.last_activity;

  let streak = 1;
  if (last === today) {
    streak = profile.streak; // already active today
  } else if (last === yesterdayString()) {
    streak = profile.streak + 1; // consecutive day
  }

  await supabase
    .from("profiles")
    .update({ streak, last_activity: today })
    .eq("id", userId);
}

/** The single entry point: award XP and touch the streak together. */
export async function recordProgress(userId: string, xp: number) {
  await Promise.all([awardXp(userId, xp), updateStreak(userId)]);
}