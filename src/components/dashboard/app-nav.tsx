import Link from "next/link";
import { GraduationCap } from "lucide-react";

/**
 * Checkpoint 12 — mobile shell header.
 * Just the brand mark: primary navigation moved to the fixed bottom nav,
 * so the top strip is gone (no dueling navs on small screens).
 */
export function AppNav() {
  return (
    <nav className="mb-8 lg:hidden">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Link
          href="/dashboard"
          aria-label="UniMate — overview"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow-primary">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-sm">UniMate</span>
        </Link>
      </div>
    </nav>
  );
}