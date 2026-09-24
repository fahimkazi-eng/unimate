import Link from "next/link";
import { ArrowRight, CheckCircle2, Siren } from "lucide-react";
import type { Crisis } from "@/lib/emergency";
import { cn } from "@/lib/utils";

/**
 * V3 Phase C §20 — Emergency card, controlled.
 *
 * Resting state: neutral tone, honest "you're managing the load" copy.
 * Urgent state (a real crisis detected server-side): red accents + the
 * actual task. Red only where time is genuinely short — never decorative.
 *
 * The "I'm Screwed → Fix My Schedule" CTA is the stable, always-visible
 * escape hatch into Emergency mode (v1 feature, kept).
 */

interface EmergencyPreviewProps {
  crisis: Crisis | null;
  /** Open task with ANY due date — used for grounding copy when calm. */
  openDatedTasks: number;
}

export function EmergencyPreview({ crisis, openDatedTasks }: EmergencyPreviewProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border p-5",
        crisis
          ? "border-danger/60 bg-danger/10"
          : "border-border bg-surface"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em]",
            crisis ? "text-danger" : "text-muted-foreground"
          )}
        >
          <Siren className="h-3.5 w-3.5" aria-hidden />
          Emergency mode
        </p>
        {crisis ? (
          <span
            className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          >
            Active
          </span>
        ) : null}
      </div>

      {crisis ? (
        <div className="mt-3">
          <p className="text-lg font-bold text-danger">{crisis.headline}</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {crisis.task.title}
          </p>
          {crisis.task.course?.name ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {crisis.task.course.name}
            </p>
          ) : null}
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Time is genuinely tight. Emergency mode rebuilds your next few days
            around what&apos;s actually due — no silent changes, it only advises.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-1 flex-col">
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
            {openDatedTasks === 0
              ? "Nothing due yet — clear skies"
              : "You're managing the load"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            No task is overdue or due inside the next 7 days. If things pile up,
            Emergency mode is one tap away.
          </p>
        </div>
      )}

      <Link
        href="/dashboard/emergency"
        className={cn(
          "mt-4 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-colors",
          crisis
            ? "bg-danger text-white hover:bg-danger/90"
            : "border border-border bg-secondary text-foreground hover:bg-muted"
        )}
      >
        {crisis ? "Fix my schedule" : "I&apos;m Screwed → fix my schedule"}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}