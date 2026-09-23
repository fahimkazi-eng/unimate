import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, Flame, Timer } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
        <div>
          <Badge>Your student operating system</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            University is complicated.
            <br />
            <span className="text-primary">Your tools don&apos;t have to be.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
            Plan your semester, manage deadlines, study smarter, and prepare
            for your career — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" href="/signup">
              Get Started
            </Button>
            <Button size="lg" variant="outline" href="#how-it-works">
              See How It Works
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Free during V1 · No required AI · Built for real universities
          </p>
        </div>

        {/* Mock dashboard preview */}
        <div className="relative">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Good evening, Fahim 👋
                </p>
                <p className="text-sm text-muted-foreground">
                  You have 3 things to take care of today.
                </p>
              </div>
              <Flame className="h-6 w-6 text-warning" />
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Database Systems Assignment</p>
                    <p className="text-xs text-muted-foreground">Due in 2 days</p>
                  </div>
                </div>
                <Badge variant="warning">High</Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <Timer className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Today&apos;s focus</p>
                    <p className="text-xs text-muted-foreground">Study Database Systems — 60 min</p>
                  </div>
                </div>
                <Badge>Start</Badge>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Semester progress</span>
                <span className="font-medium text-foreground">78%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[78%] rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}