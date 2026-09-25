import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AmbientBackground } from "@/components/landing/ambient-background";
import { HeroPreview } from "@/components/landing/hero-preview";
import { staggerDelay } from "@/lib/motion";
import { CalendarClock, CheckCircle2, Flame, Timer, Trophy } from "lucide-react";

/**
 * Homepage hero — visual overhaul.
 * Deep Space ambience, a staged entrance (staggerDelay), an animated
 * gradient brand line, a living product preview (HeroPreview) and a
 * floating XP chip. Everything is token-based and theme-aware.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <AmbientBackground />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
        <div>
          <div className="animate-rise-in" style={{ animationDelay: staggerDelay(0) }}>
            <Badge className="border-primary/30 bg-primary-soft text-primary shadow-glow-primary">
              <span aria-hidden>✦</span> Your student operating system
            </Badge>
          </div>

          <h1
            className="mt-4 animate-rise-in text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            style={{ animationDelay: staggerDelay(1) }}
          >
            University is complicated.
            <br />
            <span className="text-gradient">Your tools don&apos;t have to be.</span>
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
            <Button
              size="lg"
              href="/signup"
              className="bg-gradient-cta shadow-lg shadow-glow-primary"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              href="#how-it-works"
              className="border-border/80 bg-surface-glass backdrop-blur-sm"
            >
              See UniMate in Action
            </Button>
          </div>

          <p
            className="mt-6 animate-rise-in text-sm text-muted-foreground"
            style={{ animationDelay: staggerDelay(4) }}
          >
            Free · Email or Google sign-in · Optional AI coach
          </p>
        </div>

        {/* Living app preview + floating XP chip */}
        <div
          className="relative animate-rise-in"
          style={{ animationDelay: staggerDelay(5) }}
        >
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg shadow-glow-accent">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">
                  Good evening, Fahim 👋
                </p>
                <p className="text-sm text-muted-foreground">
                  Watch UniMate handle your day.
                </p>
              </div>
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                <Trophy className="h-3 w-3" />
                Level 7 · 1,240 XP
              </Badge>
            </div>

            <div className="mt-5">
              <HeroPreview />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                    <CalendarClock className="h-4 w-4" />
                  </span>
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
                  <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
                    <Timer className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Today&apos;s focus
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Study Database Systems — 60 min
                    </p>
                  </div>
                </div>
                <Badge className="border-orange-500/30 bg-orange-500/10 text-orange-400">
                  <Flame className="h-3 w-3" />
                  4 day streak
                </Badge>
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