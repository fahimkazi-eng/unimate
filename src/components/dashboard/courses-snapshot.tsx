import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import type { CourseProgress } from "@/lib/queries";

/**
 * V3 Phase B §9 — "Your Courses" snapshot.
 * Each course shows its real completion progress plus the next open
 * deadline (from the user's actual tasks). Horizontal cards on mobile,
 * bento-ish grid from sm up.
 */

interface CourseSnapshotCourse extends CourseProgress {
  /** Next open task with a due date (most urgent), if any. */
  nextDeadline: { title: string; label: string } | null;
}

interface CoursesSnapshotProps {
  courses: CourseSnapshotCourse[];
}

export function CoursesSnapshot({ courses }: CoursesSnapshotProps) {
  if (courses.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <BookOpen className="h-6 w-6" />
        </span>
        <div>
          <p className="text-base font-semibold text-foreground">No courses yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Add your first course and UniMate will track its tasks and deadlines.
          </p>
        </div>
        <Link
          href="/dashboard/courses"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Add your first course
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {courses.map((course) => {
        const pct =
          course.total > 0
            ? Math.round((course.completed / course.total) * 100)
            : 0;
        return (
          <li key={course.id}>
            <Link
              href="/dashboard/courses"
              className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 hover:bg-surface-elevated"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: course.color }}
                />
                <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                  {course.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out-quart"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                  {pct}%
                </span>
              </div>

              <p className="truncate text-xs text-muted-foreground">
                {course.nextDeadline ? (
                  <>
                    <span className="text-foreground">Next:</span>{" "}
                    {course.nextDeadline.title} · {course.nextDeadline.label}
                  </>
                ) : (
                  "No deadlines — catch up at your pace."
                )}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export type { CourseSnapshotCourse };