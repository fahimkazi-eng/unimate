import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { DemoFrame } from "@/components/demos/demo-frame";
import { DemoDashboard } from "@/components/demos/demo-dashboard";
import { DemoTasks } from "@/components/demos/demo-tasks";
import { DemoCourses } from "@/components/demos/demo-courses";
import { DemoFocus } from "@/components/demos/demo-focus";
import { DemoProgress } from "@/components/demos/demo-progress";
import { DemoGamification } from "@/components/demos/demo-gamification";
import { DemoCalendar } from "@/components/demos/demo-calendar";
import { DemoPlanner } from "@/components/demos/demo-planner";
import { DemoCoach } from "@/components/demos/demo-coach";
import { DemoAcademics } from "@/components/demos/demo-academics";
import { DemoEmergency } from "@/components/demos/demo-emergency";
import { DemoAuth } from "@/components/demos/demo-auth";
import {
  BookOpen,
  CalendarRange,
  CheckSquare,
  Flame,
  GraduationCap,
  LayoutDashboard,
  Siren,
  Sparkles,
  Timer,
  TrendingUp,
  UserRound,
  CalendarClock,
} from "lucide-react";

interface Feature {
  icon: ComponentType<{ className?: string }>;
  demo: ComponentType;
  title: string;
  description: string;
}

/** Shipped features (V1 + V2) — every card maps to a real page in the app. */
const features: Feature[] = [
  {
    icon: Sparkles,
    demo: DemoCoach,
    title: "Study Coach",
    description:
      "An optional AI assistant that plans from your real tasks, courses and focus stats — and honestly says so when it's offline.",
  },
  {
    icon: CalendarClock,
    demo: DemoPlanner,
    title: "Smart planner",
    description:
      "A deterministic 7-day plan from your open tasks. Advisory by design — it plans, it never silently moves your deadlines.",
  },
  {
    icon: CalendarRange,
    demo: DemoCalendar,
    title: "Calendar 2.0",
    description:
      "Month, week and agenda views of your real deadlines — plus add-a-task on any day from the calendar itself.",
  },
  {
    icon: GraduationCap,
    demo: DemoAcademics,
    title: "Academics",
    description:
      "Gradebook and a credit-weighted GPA from your actual grades — with honest status where university data isn't wired up yet.",
  },
  {
    icon: Siren,
    demo: DemoEmergency,
    title: "Emergency mode",
    description:
      "One calm screen for crunch time: the single most urgent deadline, honest load math, and what can wait.",
  },
  {
    icon: UserRound,
    demo: DemoAuth,
    title: "Sign-in & profile",
    description:
      "Email or Google sign-in, password strength hints, and a richer profile — your data stays yours.",
  },
  {
    icon: LayoutDashboard,
    demo: DemoDashboard,
    title: "Smart dashboard",
    description:
      "A personalized greeting, your next deadline, today's focus and semester progress — all on one screen.",
  },
  {
    icon: CheckSquare,
    demo: DemoTasks,
    title: "Tasks & deadlines",
    description:
      "Create tasks with courses, due dates, priorities and estimated time. Complete them as you go.",
  },
  {
    icon: BookOpen,
    demo: DemoCourses,
    title: "Courses",
    description:
      "Structure everything around your actual courses, each with a color so your schedule stays scannable.",
  },
  {
    icon: Timer,
    demo: DemoFocus,
    title: "Focus timer",
    description:
      "25/5, 50/10 or 60/10 focus sessions. Every finished session adds to your real study time.",
  },
  {
    icon: TrendingUp,
    demo: DemoProgress,
    title: "Progress tracking",
    description:
      "Study hours per week, tasks completed, and course progress — simple analytics, no noise.",
  },
  {
    icon: Flame,
    demo: DemoGamification,
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
          <Badge>Included in V2</Badge>
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
            <Reveal key={feature.title} delay={Math.min(i, 5) * 70}>
              <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-card transition-shadow hover:shadow-card-hover">
                <DemoFrame>
                  <feature.demo />
                </DemoFrame>
                <div className="mt-4 flex items-center gap-2">
                  <feature.icon className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>
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