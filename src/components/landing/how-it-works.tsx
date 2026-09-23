import { BookOpenCheck, ListTodo, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: ListTodo,
    title: "Plan your semester",
    description:
      "Add your courses, tasks and deadlines. Campus Hub shows you what matters right now — not a cluttered list.",
  },
  {
    icon: BookOpenCheck,
    title: "Study with focus",
    description:
      "Run guided focus sessions tied to real courses. Every session is recorded so your progress reflects reality.",
  },
  {
    icon: TrendingUp,
    title: "Track your progress",
    description:
      "See completed tasks, study hours and streaks at a glance. Momentum you can actually measure.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-t border-border bg-surface py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One dashboard that connects planning, studying and progress.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-xl border border-border bg-background p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-1 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}