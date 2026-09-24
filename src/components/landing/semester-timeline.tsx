import { Reveal } from "@/components/ui/reveal";

const MILESTONES = [
  {
    week: "Week 1–2",
    label: "Map your semester",
    note: "Add your courses, color-code everything, drop in the big deadlines.",
  },
  {
    week: "Week 3–8",
    label: "Stay ahead of deadlines",
    note: "Your next move always knows what deserves your attention first.",
  },
  {
    week: "Week 9–12",
    label: "Find your rhythm",
    note: "Focus sessions, XP and streaks quietly build real study momentum.",
  },
  {
    week: "Finals",
    label: "Finish strong",
    note: "Progress bars show exactly where you are — no surprises in exam season.",
  },
];

/** "Your semester at a glance" — a product-shaped timeline (Checkpoint 8). */
export function SemesterTimeline() {
  return (
    <ol className="relative space-y-7 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border">
      {MILESTONES.map((milestone, i) => (
        <Reveal key={milestone.week} delay={i * 90}>
          <li className="relative flex gap-4">
            <span className="relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {milestone.week}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {milestone.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {milestone.note}
              </p>
            </div>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}