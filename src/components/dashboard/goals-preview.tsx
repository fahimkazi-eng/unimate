import Link from "next/link";
import { ArrowUpRight, Target, Trophy } from "lucide-react";
import { GOAL_LABELS, GOAL_UNITS } from "@/lib/goal-meta";
import type { GoalWithProgress } from "@/lib/goals";

/**
 * V3 Phase C §18 — Current goals, live preview.
 * Progress comes from the user's REAL activity (same math as the Goals
 * page). Only a subset is shown; to the Goals page for the full list.
 */

interface GoalsPreviewProps {
  goals: GoalWithProgress[];
  /** Table-missing / network error — surface honestly instead of crashing. */
  error: string | null;
}

export function GoalsPreview({ goals, error }: GoalsPreviewProps) {
  const shown = goals.slice(0, 3);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-warning/50 bg-warning/10 p-6 text-center">
        <p className="text-sm font-medium text-warning">Goals aren&apos;t set up yet</p>
        <p className="text-xs text-muted-foreground">
          Run <code className="font-medium">supabase/v3_goals.sql</code> once in the
          SQL Editor.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Current goals</p>
        <Link
          href="/dashboard/goals"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Open goals
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Target className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Set something worth finishing
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              A goal turns busy work into an actual target.
            </p>
          </div>
          <Link
            href="/dashboard/goals"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Target className="h-4 w-4" />
            Create a goal
          </Link>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {shown.map((goal) => {
            const pct = Math.round(goal.progress * 100);
            const unit = GOAL_UNITS[goal.measure];
            return (
              <li key={goal.id}>
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      goal.complete
                        ? "bg-emerald-500/90 text-white"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {goal.complete ? (
                      <Trophy className="h-3.5 w-3.5" />
                    ) : (
                      <Target className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {goal.title}
                  </p>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {Math.min(goal.current, goal.target).toLocaleString()}/
                    {goal.target.toLocaleString()} {unit}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-400/90 transition-[width] duration-500 ease-out-quart"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {GOAL_LABELS[goal.measure]}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}