import { Flame, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { xpForNextLevel, xpIntoLevel } from "@/lib/gamification";

interface HeroStatDef {
  key: string;
  label: string;
  icon: typeof Flame;
  value: number;
  suffix?: string;
  hint: string;
  /** Show a slim progress bar under the value (XP-into-level). */
  progress?: number;
}

interface HeroProps {
  greeting: string;
  name: string;
  headline: string;
  subline: string;
  streak: number;
  level: number;
  xp: number;
  /** 0–100 task completion (real, honest "semester progress" proxy). */
  taskProgress: number;
  tasksDone: number;
  tasksTotal: number;
}

/**
 * V3 Phase A §4 — the command-center hero.
 * Time-aware greeting + a headline that adapts to the student's REAL state
 * (computed server-side in `buildHeroHeadline`, never faked). Stats use
 * count-up animation (reduced-motion aware) instead of badge pills.
 */
export function Hero({
  greeting,
  name,
  headline,
  subline,
  streak,
  level,
  xp,
  taskProgress,
  tasksDone,
  tasksTotal,
}: HeroProps) {
  const intoLevel = xpIntoLevel(xp);
  const toNext = xpForNextLevel(level);
  const xpProgress = toNext > 0 ? Math.min(100, (intoLevel / toNext) * 100) : 0;

  const stats: HeroStatDef[] = [
    {
      key: "streak",
      label: "Streak",
      icon: Flame,
      value: streak,
      suffix: "d",
      hint: streak > 0 ? "Keep it alive today" : "Start one today",
    },
    {
      key: "level",
      label: "Level",
      icon: Trophy,
      value: level,
      hint: `Level ${level} of the climb`,
    },
    {
      key: "xp",
      label: "XP",
      icon: Sparkles,
      value: xp,
      hint: `${toNext - intoLevel} XP to level ${level + 1}`,
      progress: xpProgress,
    },
    {
      key: "progress",
      label: "Progress",
      icon: TrendingUp,
      value: taskProgress,
      suffix: "%",
      hint:
        tasksTotal === 0
          ? "No tasks yet"
          : `${tasksDone}/${tasksTotal} tasks complete`,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Soft brand glow — static, transform-free (cheap on mobile GPUs). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          {greeting}, {name}
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          {headline}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          {subline}
        </p>

        {/* Stat cluster — elegant, no pills. */}
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-6 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.key} className="min-w-0">
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {stat.label}
                </dt>
                <dd className="mt-1.5 text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
                  <AnimatedNumber value={stat.value} />
                  {stat.suffix ? (
                    <span className="ml-0.5 text-base font-semibold text-muted-foreground">
                      {stat.suffix}
                    </span>
                  ) : null}
                </dd>
                {stat.progress !== undefined ? (
                  <div
                    className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted"
                    role="presentation"
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out-quart"
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                ) : null}
                <dd className="mt-2 truncate text-xs text-muted-foreground">
                  {stat.hint}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}