import Link from "next/link";
import { ArrowUpRight, CalendarClock, Clock3, Sparkles, UserRoundCheck } from "lucide-react";
import { formatGpa } from "@/lib/grades";

/**
 * V3 Phase B §10 — Academic Pulse.
 * Only REAL numbers are shown: GPA comes from the user's actual gradebook.
 * Attendance and exams have no data model yet, so those tiles are openly
 * marked "not tracked yet" instead of inventing an 87% or a fake exam date.
 */

interface AcademicPulseProps {
  /** Weighted GPA on the 4.0 scale, or null when there are no grades yet. */
  gpa: number | null;
  gradeCount: number;
  totalCredits: number;
  /** Next open deadline — stands in for an exam countdown, honestly. */
  nextDeadline: { title: string; label: string } | null;
}

export function AcademicPulse({
  gpa,
  gradeCount,
  totalCredits,
  nextDeadline,
}: AcademicPulseProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Academic pulse</p>
        <Link
          href="/dashboard/academics"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Open Academics
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {/* GPA — the one real, headline number. */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            GPA
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {gpa !== null ? formatGpa(gpa) : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {gradeCount === 0
              ? "No grades yet — add one in Academics"
              : `${gradeCount} graded ${gradeCount === 1 ? "course" : "courses"} · ${totalCredits} credits`}
          </p>
        </div>

        {/* Next deadline (honest stand-in for an exam countdown). */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            Next deadline
          </p>
          <p className="mt-2 text-lg font-bold leading-tight text-foreground">
            {nextDeadline ? nextDeadline.label : "Clear"}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {nextDeadline ? nextDeadline.title : "Nothing on the horizon"}
          </p>
        </div>

        {/* Attendance — honest: not tracked yet. */}
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <UserRoundCheck className="h-3.5 w-3.5" />
            Attendance
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            Not tracked yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            On the roadmap.
          </p>
        </div>

        {/* Exams — honest: no data model. */}
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            Exam countdown
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            Coming soon
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Until then, watch your deadlines.
          </p>
        </div>
      </div>
    </div>
  );
}