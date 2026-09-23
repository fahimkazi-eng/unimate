import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  CalendarRange,
  Sparkles,
  Siren,
} from "lucide-react";

const upcoming = [
  {
    icon: Sparkles,
    title: "AI study tools",
    description: "Notes to flashcards, auto-generated quizzes, and Explain This.",
  },
  {
    icon: Siren,
    title: "Emergency Mode",
    description: "‘I’m screwed’ — a calm, practical plan when time is short.",
  },
  {
    icon: CalendarRange,
    title: "Smart planner",
    description: "Automatic task breakdown: ‘1500 words by Friday’ becomes a day-by-day plan.",
  },
  {
    icon: Briefcase,
    title: "Career tools",
    description: "CV analysis, skill gaps and a roadmap to the job you want.",
  },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="border-t border-border bg-surface py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline">On the roadmap</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            Built next — the long-term vision
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We ship in version increments. These arrive in future versions — we
            won&apos;t claim them before they exist.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-dashed border-border bg-background p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <item.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline">Coming soon</Badge>
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}