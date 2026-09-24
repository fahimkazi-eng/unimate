import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

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
          <BrandMark className="shadow-glow-primary" />
          <span className="text-sm">UniMate</span>
        </Link>
      </div>
    </nav>
  );
}