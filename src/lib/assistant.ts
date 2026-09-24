import "server-only";

/**
 * V2 Phase 5 — Study Coach plumbing.
 * Everything AI-related lives here and on the server action: the API key is
 * read from env only (spec 46), the client never sees it.
 */

export interface CoachCourseRow {
  name: string;
  open: number;
  completed: number;
  nextDue: string | null;
}

export interface CoachContextData {
  name: string;
  level: number;
  xp: number;
  streak: number;
  openTasks: number;
  completedTasks: number;
  focusMinutesWeek: number;
  sessionsWeek: number;
  courses: CoachCourseRow[];
  nextDeadline: { title: string; due: string } | null;
}

/**
 * Compact, real-data summary sent to the model as grounding. Pure — takes
 * plain data, returns text. Never invents numbers: only what's passed in.
 */
export function buildCoachContext(data: CoachContextData): string {
  const lines: string[] = [];
  lines.push(`Student: ${data.name}`);
  lines.push(`Level ${data.level} · ${data.xp} XP · ${data.streak}-day streak`);
  lines.push(
    `Tasks: ${data.openTasks} open · ${data.completedTasks} completed`
  );
  lines.push(
    `Focus this week: ${data.focusMinutesWeek} min across ${data.sessionsWeek} sessions`
  );
  if (data.nextDeadline) {
    lines.push(`Next deadline: ${data.nextDeadline.title} (${data.nextDeadline.due})`);
  }
  lines.push("Courses (open / completed):");
  for (const course of data.courses) {
    lines.push(
      `- ${course.name}: ${course.open} open, ${course.completed} done${
        course.nextDue ? `, next due ${course.nextDue}` : ""
      }`
    );
  }
  return lines.join("\n");
}

export interface CoachTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Calls an OpenAI-compatible chat-completions endpoint. Returns null when no
 * key is configured (the action turns that into an honest message) or when
 * the call fails — a degraded reply beats a crash.
 */
export async function askLlm(
  systemPrompt: string,
  messages: CoachTurn[]
): Promise<string | null> {
  const key = process.env.ASSISTANT_API_KEY;
  if (!key) return null;

  const base = (process.env.ASSISTANT_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.ASSISTANT_MODEL ?? "gpt-4o-mini";

  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 600,
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    return typeof content === "string" && content.trim() ? content.trim() : null;
  } catch {
    return null;
  }
}