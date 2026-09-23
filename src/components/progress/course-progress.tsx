import type { CourseProgress } from "@/lib/queries";

interface CourseProgressListProps {
  courses: CourseProgress[];
}

/** One color-coded completion bar per course. */
export function CourseProgressList({ courses }: CourseProgressListProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        Add tasks to your courses and their completion rates will show here.
      </div>
    );
  }

  return (
    <ul className="space-y-5">
      {courses.map((course) => {
        const pct =
          course.total > 0
            ? Math.round((course.completed / course.total) * 100)
            : 0;
        return (
          <li key={course.id}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: course.color }}
                  aria-hidden
                />
                {course.name}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {course.completed}/{course.total} · {pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: course.color,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}