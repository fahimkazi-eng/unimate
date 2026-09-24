/**
 * Command-center hero content (V3 Phase A).
 *
 * Pure, deterministic functions — the headline adapts to the student's REAL
 * state (overdue tasks, deadlines, progress). No AI, no fakery: the text is
 * chosen from actual data on the server, the same way `pickNextMove` works.
 */

/** Time-aware greeting, e.g. "Good evening". */
export function greetingForHour(hour: number): string {
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export interface HeroHeadlineInput {
  /** Incomplete tasks past their due date. */
  overdueCount: number;
  /** Any incomplete task due before the end of today. */
  hasDueToday: boolean;
  /** The soonest upcoming deadline (never an overdue one). */
  nextDeadline: {
    title: string;
    /** Whole days from today (0 = today, 1 = tomorrow…). */
    days: number;
    /** Human label, e.g. "Due tomorrow" (from formatRelative). */
    relative: string;
  } | null;
  /** Any real activity so far (tasks, focus time or courses). */
  hasActivity: boolean;
}

export interface HeroHeadline {
  headline: string;
  subline: string;
}

/** Priority-ordered, honest headline for the hero — no fake AI. */
export function buildHeroHeadline(input: HeroHeadlineInput): HeroHeadline {
  const { overdueCount } = input;

  if (overdueCount > 0) {
    const n = overdueCount;
    return {
      headline: `You have ${n} ${n === 1 ? "thing" : "things"} to catch up on.`,
      subline:
        n === 1
          ? "One task slipped past its deadline — clear it and the week opens up."
          : `${n} overdue tasks are waiting. Start with the one that's been waiting longest.`,
    };
  }

  if (input.hasDueToday) {
    return {
      headline: "Something's due today.",
      subline: input.nextDeadline
        ? `"${input.nextDeadline.title}" is on the clock — here's your plan.`
        : "A deadline is on the clock — here's your plan.",
    };
  }

  if (input.nextDeadline && input.nextDeadline.days <= 7) {
    const label =
      input.nextDeadline.days === 1
        ? "tomorrow"
        : `in ${input.nextDeadline.days} days`;
    return {
      headline: `Your next deadline is ${label}.`,
      subline: `"${input.nextDeadline.title}" ${input.nextDeadline.relative
        .toLowerCase()
        .replace(/^due /, "is due ")}. A little prep now keeps it calm later.`,
    };
  }

  if (input.hasActivity) {
    return {
      headline: "You're on track. Let's keep the momentum.",
      subline:
        "Real progress is building — keep showing up and it compounds.",
    };
  }

  return {
    headline: "Let's get your semester under control.",
    subline:
      "Add your first course and task — UniMate turns the chaos into a plan.",
  };
}