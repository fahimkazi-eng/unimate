import Link from "next/link";
import { ArrowUpRight, Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * V3 Phase C §19 — Achievements showcase.
 * A few unlocked medals + the closest locked badge ("next up"), all derived
 * from the user's REAL activity by the same engine as the Achievements
 * page. Full grid lives on its own page.
 */

interface AchievementSummary {
  id: string;
  title: string;
  emoji: string;
  accent: string;
  unlocked: boolean;
  current: number;
  target: number;
  progress: number;
}

interface AchievementsPreviewProps {
  /** All states, so we can pick unlocked medals + next-up. */
  achievements: AchievementSummary[];
  unlockedCount: number;
  totalCount: number;
}

export function AchievementsPreview({
  achievements,
  unlockedCount,
  totalCount,
}: AchievementsPreviewProps) {
  const unlocked = achievements.filter((a) => a.unlocked);
  const shownUnlocked = unlocked.slice(0, 4);
  const nextUp =
    achievements.filter((a) => !a.unlocked).sort((a, b) => b.progress - a.progress)[0] ??
    null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Achievements</p>
        <Link
          href="/dashboard/achievements"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all achievements
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {unlockedCount === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <Trophy className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-foreground">
            First badge is close
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Complete your first task to earn &ldquo;First win&rdquo;.
          </p>
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {shownUnlocked.map((badge) => (
              <span
                key={badge.id}
                title={badge.title}
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl transition-transform duration-200 ease-out-quart",
                  `bg-gradient-to-br ${badge.accent} shadow-glow-primary`
                )}
              >
                <span className="drop-shadow">{badge.emoji}</span>
              </span>
            ))}
            {unlockedCount > shownUnlocked.length ? (
              <span className="flex h-11 shrink-0 items-center justify-center rounded-full border border-border px-3 text-xs font-medium text-muted-foreground">
                +{unlockedCount - shownUnlocked.length}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs tabular-nums text-muted-foreground">
            {unlockedCount}/{totalCount} earned
          </p>
        </div>
      )}

      {/* Next up — closest locked badge */}
      <div className="mt-auto pt-4">
        {nextUp ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Lock className="h-3 w-3" />
              Next up · {nextUp.title}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-brand transition-[width] duration-500 ease-out-quart"
                style={{ width: `${Math.round(Math.min(nextUp.progress, 1) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {Math.max(0, Math.ceil(nextUp.target - nextUp.current))} more to unlock
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-center">
            <p className="text-sm font-medium text-foreground">
              Every badge collected 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}