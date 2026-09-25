import Link from "next/link";
import { ArrowUpRight, Flame, ListChecks, Timer, TrendingUp } from "lucide-react";
import { WeeklyChart } from "@/components/progress/weekly-chart";
import { xpForNextLevel, xpIntoLevel } from "@/lib/gamification";
import type { StudyDay } from "@/lib/queries";

/**
 * V3 Phase C §17 — Your Progress.
 * Real numbers only: study minutes/sessions this week, tasks done, streak
 * and the XP-into-level bar — all computed on the server from the user's
 * actual activity.
 */

interface ProgressPreviewProps {
  days: StudyDay[];
  weekMinutes: number;
  weekSessions: number;
  tasksCompleted: number;
  tasksTotal: number;
  streak: number;
  xp: number;
  level: number;
}

function minutesLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function ProgressPreview({
  days,
  weekMinutes,
  weekSessions,
  tasksCompleted,
  tasksTotal,
  streak,
  xp,
  level,
}: ProgressPreviewProps) {
  const intoLevel = xpIntoLevel(xp);
  const toNext = xpForNextLevel(level);
  const levelPct = toNext > 0 ? Math.min(100, (intoLevel / toNext) * 100) : 0;

  const stats = [
    {
      icon: Timer,
      label: "Focused this week",
      value: minutesLabel(weekMinutes),
      hint: `${weekSessions} session${weekSessions === 1 ? "" : "s"}`,
      tone: "text-cyan-400",
    },
    {
      icon: ListChecks,
      label: "Tasks done",
      value: String(tasksCompleted),
      hint:
        tasksTotal === 0 ? "no tasks yet" : `${Math.round((tasksCompleted / tasksTotal) * 100)}% of all tasks`,
      tone: "text-violet-400",
    },
    {
      icon: Flame,
      label: "Streak",
      value: `${streak}d`,
      hint: streak > 0 ? "keep it alive" : "start one today",
      tone: "text-amber-400",
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Your progress</p>
        <Link
          href="/dashboard/progress"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View progress
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-surface p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                <Icon className={`h-3 w-3 ${stat.tone}`} aria-hidden />
                <span className="truncate">{stat.label}</span>
              </p>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-foreground">
                {stat.value}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {stat.hint}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <WeeklyChart days={days} />
      </div>

      {/* XP into next level — real gamification progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="mr-1 inline h-3 w-3" aria-hidden />
            Level {level} · {intoLevel}/{toNext} XP to level {level + 1}
          </p>
        </div>
        <div
          className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="presentation"
        >
          <div
            className="h-full rounded-full bg-gradient-brand transition-[width] duration-500 ease-out-quart"
            style={{ width: `${levelPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}