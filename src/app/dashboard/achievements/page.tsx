import { Flame, Lock, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getAchievements } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import {
  levelFromXp,
  xpForNextLevel,
  xpIntoLevel,
} from "@/lib/gamification";
import { getOrCreateProfile } from "@/lib/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "Achievements — UniMate",
};

export const dynamic = "force-dynamic";

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Circular unlock-progress ring (SVG, transform/opacity only — GPU friendly). */
function ProgressRing({ percent, children }: { percent: number; children: React.ReactNode }) {
  const offset = RING_CIRCUMFERENCE * (1 - percent / 100);
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out-quart"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/** Badge medal — glowing gradient when unlocked, muted + grey when locked. */
function Medal({ emoji, accent, unlocked }: { emoji: string; accent: string; unlocked: boolean }) {
  return (
    <div
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-transform duration-200 ease-out-quart",
        unlocked
          ? `bg-gradient-to-br ${accent} shadow-glow-primary group-hover:scale-105`
          : "bg-muted grayscale"
      )}
      aria-hidden
    >
      <span className={cn(unlocked ? "drop-shadow" : "opacity-70")}>{emoji}</span>
    </div>
  );
}

export default async function AchievementsPage() {
  const user = await requireUser();

  const [report, profile] = await Promise.all([
    getAchievements(user.id),
    getOrCreateProfile(user.id),
  ]);

  const { achievements, unlockedCount, totalCount, nextUp } = report;
  const unlockPct = Math.round((unlockedCount / totalCount) * 100);

  const xp = profile?.xp ?? 0;
  const level = levelFromXp(xp);
  const intoLevel = xpIntoLevel(xp);
  const nextLevelXp = xpForNextLevel(level);
  const levelPct = Math.min(100, Math.round((intoLevel / nextLevelXp) * 100));
  const streak = profile?.streak ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Badges earned from your real progress — every one unlocks from
          something you actually did.
        </p>
      </header>

      <div className="mt-8 grid [&>*]:min-w-0 gap-6 lg:grid-cols-3">
        {/* Unlock ring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Badges unlocked
            </CardTitle>
            <CardDescription>
              {unlockedCount} of {totalCount} collected.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-2">
            <ProgressRing percent={unlockPct}>
              <span className="text-2xl font-bold text-foreground">
                {unlockPct}%
              </span>
              <span className="text-xs text-muted-foreground">
                {unlockedCount}/{totalCount}
              </span>
            </ProgressRing>
          </CardContent>
        </Card>

        {/* Level + XP */}
        <Card>
          <CardHeader>
            <CardTitle>Level &amp; XP</CardTitle>
            <CardDescription>
              {xp} total XP · {intoLevel}/{nextLevelXp} to level {level + 1}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{level}</span>
              <span className="text-sm text-muted-foreground">current level</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${levelPct}%` }}
              />
            </div>
            <Badge variant={streak > 0 ? "warning" : "outline"}>
              <Flame className="h-3 w-3" />
              {streak} day streak
            </Badge>
          </CardContent>
        </Card>

        {/* Next up */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Next up
            </CardTitle>
            <CardDescription>
              {nextUp
                ? "The badge you're closest to unlocking."
                : "Every badge collected — incredible."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nextUp ? (
              <div className="group flex items-center gap-4">
                <Medal
                  emoji={nextUp.emoji}
                  accent={nextUp.accent}
                  unlocked={false}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{nextUp.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Need{" "}
                    {Math.max(0, Math.ceil(nextUp.target - nextUp.current))}{" "}
                    more.
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(nextUp.progress * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing left to chase — for now. 🎉
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Badge grid */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">All badges</h2>
        <div className="mt-4 grid [&>*]:min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {achievements.map((badge, i) => (
            <Reveal key={badge.id} delay={Math.min(i * 40, 200)}>
              <Card
                className={
                  badge.unlocked
                    ? "h-full border-primary/25"
                    : "h-full opacity-90"
                }
              >
                <CardContent className="group flex h-full flex-col gap-3 pt-6">
                  <div className="flex items-center justify-between">
                    <Medal
                      emoji={badge.emoji}
                      accent={badge.accent}
                      unlocked={badge.unlocked}
                    />
                    {badge.unlocked ? (
                      <Badge variant="default">Unlocked</Badge>
                    ) : (
                      <Badge variant="outline">Locked</Badge>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">
                      {badge.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {badge.description}
                    </p>
                  </div>

                  {badge.unlocked ? (
                    <p className="mt-auto text-xs font-medium text-primary">
                      Collected
                    </p>
                  ) : (
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {Math.min(badge.current, badge.target)}/{badge.target}
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round(badge.progress * 100)}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.round(badge.progress * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}