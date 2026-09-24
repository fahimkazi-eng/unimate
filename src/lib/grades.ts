/**
 * Pure gradebook math for /dashboard/academics (V2 Phase 7).
 * Server-safe: no data access — pages hand in the user's grade rows, this
 * module hands back GPA numbers and status labels.
 *
 * Grading scale is a standard US 4.0 scale used only to convert the letters
 * the user *enters themselves* — never anything fabricated.
 */

export type LetterGrade =
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D+"
  | "D"
  | "D-"
  | "F";

export const LETTER_GRADES: LetterGrade[] = [
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F",
];

/** Standard 4.0 point values (A+ not offered; A is the cap). */
const GRADE_POINTS: Record<LetterGrade, number> = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
};

/** 4.0 points for a letter (unknown → 0.0). */
export function pointsForLetter(letter: string): number {
  return GRADE_POINTS[letter as LetterGrade] ?? 0;
}

export interface GradeRowLike {
  letter: string;
  /** Credit hours; defaults to 3 at the row level when absent. */
  credits?: number | null;
}

export interface GpaReport {
  /** Weighted GPA on the 4.0 scale, or null when there are no grades yet. */
  gpa: number | null;
  /** Total credit hours behind the GPA. */
  totalCredits: number;
  /** Number of graded courses. */
  gradeCount: number;
}

/**
 * Credit-weighted GPA: Σ(points × credits) / Σ(credits).
 * Ignores rows with unknown letters. Returns gpa: null for an empty set
 * (honest state — "no grades yet" instead of a fake 0.0).
 */
export function computeGpa(rows: GradeRowLike[]): GpaReport {
  let weighted = 0;
  let totalCredits = 0;
  let gradeCount = 0;

  for (const row of rows) {
    const points = pointsForLetter(row.letter);
    const credits = row.credits && row.credits > 0 ? row.credits : 3;
    if (points === 0 && row.letter !== "F") continue; // unknown letter
    weighted += points * credits;
    totalCredits += credits;
    gradeCount++;
  }

  return {
    gpa: totalCredits > 0 ? weighted / totalCredits : null,
    totalCredits,
    gradeCount,
  };
}

/** "3.42" and "3.98 / 4.0" style labels. */
export const GPA_SCALE_MAX = 4.0;

export function formatGpa(gpa: number): string {
  return gpa.toFixed(2);
}

export interface CourseGradeRow extends GradeRowLike {
  course_id: string;
}

/** Per-course weighted GPA for the course snapshot cards. */
export function perCourseGpa(rows: CourseGradeRow[]): Map<string, number> {
  const byCourse = new Map<string, CourseGradeRow[]>();
  for (const row of rows) {
    const bucket = byCourse.get(row.course_id) ?? [];
    bucket.push(row);
    byCourse.set(row.course_id, bucket);
  }
  const out = new Map<string, number>();
  for (const [courseId, rowsIn] of byCourse) {
    const gpa = computeGpa(rowsIn).gpa;
    if (gpa !== null) out.set(courseId, gpa);
  }
  return out;
}