/**
 * Client-safe goal metadata — shared by the server lib (progress math),
 * the server action (validation) and the client create form (dropdowns).
 * Kept free of `server-only` so the form can import it.
 */

export type GoalMeasure =
  | "tasks-completed"
  | "focus-minutes"
  | "courses"
  | "streak";

export const GOAL_MEASURES: GoalMeasure[] = [
  "tasks-completed",
  "focus-minutes",
  "courses",
  "streak",
];

export const GOAL_LABELS: Record<GoalMeasure, string> = {
  "tasks-completed": "Tasks completed",
  "focus-minutes": "Focus minutes",
  courses: "Courses added",
  streak: "Day streak",
};

/** Short unit for progress copy, e.g. "24 / 50". */
export const GOAL_UNITS: Record<GoalMeasure, string> = {
  "tasks-completed": "tasks",
  "focus-minutes": "minutes",
  courses: "courses",
  streak: "days",
};