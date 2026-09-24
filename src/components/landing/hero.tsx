import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AmbientBackground } from "@/components/landing/ambient-background";
import { staggerDelay } from "@/lib/motion";
import {
  CalendarClock,
  CheckCircle2,
  Flame,
  Play,
  Timer,
  Trophy,
} from "lucide-react";

/**
 * Homepage hero — Checkpoint 6.
 * Ambient background, staged entrance (staggerDelay), an app-accurate
 * "Your next move" preview (Fahim demo persona, rule 10) and a floating
 * XP chip. Everything is token-based and theme-aware.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <AmbientBackground />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
        <div>
          <div className="animate-rise-in" style={{ animationDelay: staggerDelay(0) }}>
            <Badge>Your student operating system</Badge>
          </div>

          <h1
            className="mt-4 animate-rise-in text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            style={{ animationDelay: staggerDelay(1) }}
          >
            University is complicated.
            <br />
            <span className="text-primary">Your tools don&apos;t have to be.</span>
          </h1>

          <p
            className="mt-6 max-w-lg animate-rise-in text-lg leading-8 text-muted-foreground"
            style={{ animationDelay: staggerDelay(2) }}
          >
            Plan your semester, manage deadlines, study smarter, and prepare
            for your career — all in one place.
          </p>

          <div
            className="mt-8 flex animate-rise-in flex-wrap items-center gap-3"
            style={{ animationDelay: staggerDelay(3) }}
          >
            <Button size="lg" href="/signup">
              Get Started
            </Button>
            <Button size="lg" variant="outline" href="#how-it-works">
              See How It Works
            </Button>
          </div>

          <p
            className="mt-6 animate-rise-in text-sm text-muted-foreground"
            style={{ animationDelay: staggerDelay(4) }}
          >
            Free · Email or Google sign-in · Optional AI coach
          </p>
        </div>

        {/* App-accurate preview */}
        <div
          className="relative animate-rise-in"
          style={{ animationDelay: staggerDelay(5) }}
        >
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg shadow-glow-accent">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">
                  Good evening, Fahim 👋
                </p>
                <p className="text-sm text-muted-foreground">
                  3 things to take care of today.
                </p>
              </div>
              <Badge variant="default">
                <Trophy className="h-3 w-3" />
                Level 7 · 1,240 XP
              </Badge>
            </div>

            {/* The app's headline widget */}
            <div className="mt-5 rounded-xl border border-primary/30 bg-background-secondary p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                Your next move
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                Database Systems Assignment
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="default">Due tomorrow</Badge>
                <Badge variant="warning">High priority</Badge>
                <Badge variant="outline">~45 min</Badge>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground">
                  <Play className="h-3 w-3" />
                  Start focus
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--color-primary)" }}
                  />
                  Database Systems
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Linear Algebra Problem Set
                    </p>
                    <p className="text-xs text-muted-foreground">Due in 4 days</p>
                  </div>
                </div>
                <Badge variant="outline">Low</Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <Timer className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Today&apos;s focus
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Study Database Systems — 60 min
                    </p>
                  </div>
                </div>
                <Badge>
                  <Flame className="h-3 w-3" />
                  4 day streak
                </Badge>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Semester progress</span>
                <span className="font-medium text-foreground">78%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[78%] rounded-full bg-primary" />
              </div>
            </div>
          </div>

          {/* Floating completion chip */}
          <div className="absolute -right-3 -top-4 animate-float sm:-right-6">
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-foreground shadow-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              +12 XP · Task completed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}