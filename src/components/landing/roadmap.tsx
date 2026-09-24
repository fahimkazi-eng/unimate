import { Badge } from "@/components/ui/badge";
import { Briefcase, CircleCheck } from "lucide-react";

const upcoming = [
  {
    icon: Briefcase,
    title: "Career tools",
    description: "CV analysis, skill gaps and a roadmap to the job you want.",
  },
];

const shipped = [
  "AI Study Coach",
  "Smart planner",
  "Calendar 2.0",
  "Academics & GPA",
  "Emergency mode",
  "Google sign-in",
];

export function Roadmap() {
  return (
    <section id="roadmap" className="scroll-mt-16 border-t border-border bg-surface py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline">Still ahead</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            One thing left on the list
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We ship in version increments and we won&apos;t claim anything
            before it exists — so here&apos;s the honest picture.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-xl">
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

          <div className="mt-6 rounded-xl border border-border bg-background p-6">
            <h3 className="text-sm font-semibold text-foreground">
              Already shipped in V2
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {shipped.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CircleCheck className="h-4 w-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}