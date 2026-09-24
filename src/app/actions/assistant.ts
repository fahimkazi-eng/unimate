"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth";
import {
  getCourses,
  getOrCreateProfile,
  getStudyStats,
  getTasks,
} from "@/lib/queries";
import { askLlm, buildCoachContext } from "@/lib/assistant";
import { formatShort } from "@/lib/dates";
import { levelFromXp } from "@/lib/gamification";
import type { TaskWithCourse } from "@/lib/database.types";

/**
 * V2 Phase 5 — Study Coach reply.
 * Real data only, server-side only: the model sees a compact summary of the
 * user's actual tasks/courses/focus stats (spec 46 — the key never leaves
 * the server). When no key is configured the coach says so honestly instead
 * of pretending to be intelligent.
 */

export type CoachState = { reply: string } | { error: string };

const coachSchema = z.object({
  message: z.string().trim().min(1, "Ask something.").max(500),
  history: z.string().trim().max(4000).optional(),
});

const SYSTEM_PROMPT = `You are UniMate's Study Coach — a calm, practical study planner built into the UniMate student OS.

Ground every answer in the USER CONTEXT below (it is the student's real UniMate data — never invent numbers, tasks, or courses that aren't listed). Keep replies short and concrete: under ~120 words, one clear next step first, then supporting detail. Use plain language, no bullet spam, no fluff. If the student asks something UniMate can't do or you can't know, say so honestly and suggest the closest real alternative.`;

type Turn = { role: "user" | "assistant"; content: string };

function parseHistory(raw: string | undefined): Turn[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (t): t is Turn =>
          !!t &&
          typeof t.content === "string" &&
          t.content.length <= 2000 &&
          (t.role === "user" || t.role === "assistant")
      )
      .slice(-10);
  } catch {
    return [];
  }
}

function nextDueFor(tasks: TaskWithCourse[]): string | null {
  const dates = tasks
    .filter((t) => t.status !== "completed" && t.due_date)
    .map((t) => new Date(t.due_date as string).getTime())
    .sort((a, b) => a - b);
  return dates.length > 0 ? formatShort(new Date(dates[0]).toISOString()) : null;
}

export async function coachReply(input: {
  message: string;
  history?: string;
}): Promise<CoachState> {
  const parsed = coachSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors.message?.[0];
    return { error: first ?? "Couldn't read that message." };
  }

  const user = await requireUser();

  const [profile, tasks, courses, stats] = await Promise.all([
    getOrCreateProfile(user.id),
    getTasks(user.id),
    getCourses(user.id),
    getStudyStats(user.id),
  ]);

  const openTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.length - openTasks.length;

  const courseRows = courses.map((course) => {
    const owned = tasks.filter((t) => t.course_id === course.id);
    return {
      name: course.name,
      open: owned.filter((t) => t.status !== "completed").length,
      completed: owned.filter((t) => t.status === "completed").length,
      nextDue: nextDueFor(owned),
    };
  });

  const nextDeadline = openTasks
    .filter((t) => t.due_date)
    .sort(
      (a, b) =>
        new Date(a.due_date as string).getTime() -
        new Date(b.due_date as string).getTime()
    )[0];

  const name =
    profile?.nickname ??
    profile?.display_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    "student";

  const context = buildCoachContext({
    name,
    level: levelFromXp(profile?.xp ?? 0),
    xp: profile?.xp ?? 0,
    streak: profile?.streak ?? 0,
    openTasks: openTasks.length,
    completedTasks,
    focusMinutesWeek: stats.minutes,
    sessionsWeek: stats.sessions,
    courses: courseRows,
    nextDeadline: nextDeadline
      ? {
          title: nextDeadline.title,
          due: formatShort(nextDeadline.due_date as string),
        }
      : null,
  });

  const system = `${SYSTEM_PROMPT}\n\nUSER CONTEXT (real data):\n${context}`;
  const history = parseHistory(parsed.data.history);
  const reply = await askLlm(system, [
    ...history,
    { role: "user", content: parsed.data.message },
  ]);

  if (reply === null) {
    return {
      reply:
        "I'm not wired up yet — this project has no AI assistant key on the server. Add an ASSISTANT_API_KEY (server-side env only, never in the browser) and I'll answer from your real study data. Until then, the smart cards on this page already work from your actual tasks and focus time.",
    };
  }

  return { reply };
}