import type { ReactNode } from "react";

/**
 * Shared frame for the "Live demo" panels on the homepage.
 * Fixed height keeps the feature grid even; inner content is centered.
 */
export function DemoFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-28 overflow-hidden rounded-lg border border-border bg-background-secondary">
      <div className="absolute right-2 top-2 z-10 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Live demo
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}