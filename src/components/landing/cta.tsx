import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="border-t border-border bg-surface py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl bg-primary px-6 py-14 text-center shadow-card-hover sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">
            Ready to survive university?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-primary-foreground/80">
            Create a free account and get your student dashboard in under a
            minute.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              variant="secondary"
              href="/signup"
              className="bg-surface text-foreground hover:bg-muted"
            >
              Get Started — it&apos;s free
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}