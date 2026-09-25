import Link from "next/link";
import { ArrowUpRight, CalendarClock, Clock3, Sparkles, UserRoundCheck } from "lucide-react";
import { formatGpa } from "@/lib/grades";
import type { CSSProperties } from "react";

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
        {/* GPA — the one real, headline number, with a radial gauge arc. */}
        <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-surface p-4">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl"
          />
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            GPA
          </p>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {gpa !== null ? formatGpa(gpa) : "—"}
            </p>
            {gpa !== null ? (
              <span
                aria-hidden
                className="relative h-10 w-10"
                style={
                  {
                    "--gauge": Math.round((gpa / 4) * 100),
                    "--gauge-color": "#a78bfa",
                  } as CSSProperties
                }
              >
                <span className="gauge-ring block h-10 w-10 opacity-90" />
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {gradeCount === 0
              ? "No grades yet — add one in Academics"
              : `${gradeCount} graded ${gradeCount === 1 ? "course" : "courses"} · ${totalCredits} credits`}
          </p>
        </div>

        {/* Next deadline (honest stand-in for an exam countdown). */}
        <div className="rounded-xl border border-amber-500/30 bg-surface p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 text-amber-400" />
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
            <UserRoundCheck className="h-3.5 w-3.5 text-cyan-400" />
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
            <Clock3 className="h-3.5 w-3.5 text-rose-400" />
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