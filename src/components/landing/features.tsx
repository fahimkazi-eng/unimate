import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import {
  BookOpen,
  CheckSquare,
  Flame,
  LayoutDashboard,
  Timer,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Smart dashboard",
    description:
      "A personalized greeting, your next deadline, today's focus and semester progress — all on one screen.",
  },
  {
    icon: CheckSquare,
    title: "Tasks & deadlines",
    description:
      "Create tasks with courses, due dates, priorities and estimated time. Complete them as you go.",
  },
  {
    icon: BookOpen,
    title: "Courses",
    description:
      "Structure everything around your actual courses, each with a color so your schedule stays scannable.",
  },
  {
    icon: Timer,
    title: "Focus timer",
    description:
      "25/5, 50/10 or 60/10 focus sessions. Every finished session adds to your real study time.",
  },
  {
    icon: TrendingUp,
    title: "Progress tracking",
    description:
      "Study hours per week, tasks completed, and course progress — simple analytics, no noise.",
  },
  {
    icon: Flame,
    title: "Study streaks",
    description:
      "Quiet, mature gamification. Consistency rewards you with streaks and XP, not confetti.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge>Included in V1</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            Your semester, connected
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Instead of five disconnected tools, one student dashboard that
            actually works together.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 70}>
              <div className="h-full rounded-xl border border-border bg-surface p-6 shadow-card transition-shadow hover:shadow-card-hover">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}