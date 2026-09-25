import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function Cta() {
  return (
    <section className="border-t border-border bg-background-secondary/60 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-cta px-6 py-14 text-center shadow-lg shadow-glow-primary sm:px-12">
          {/* Soft inner light */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 65% 60% at 50% -15%, rgb(255 255 255 / 0.18), transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to survive university?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-white/85">
              Create a free account and get your student dashboard in under a
              minute.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                href="/signup"
                className="bg-white text-foreground shadow-lg hover:bg-white/90"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Get Started — it&apos;s free
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}