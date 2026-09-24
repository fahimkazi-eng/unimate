"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * V2 Phase 2 — the single source of truth for the UniMate brand mark.
 *
 * Renders `public/logo.jpeg` (the dark glow-tile logo asset) directly and
 * only falls back to the graduation-cap placeholder if the image ever fails
 * to load (asset missing). The asset lives at a fixed path, so every surface
 * (navbar, footer, auth pages, sidebar, mobile header) shares one logo —
 * proportions, tile radius, spacing and glow consistency live here (spec 4).
 *
 * Note: reveal-on-load is deliberately NOT used — on server-rendered pages
 * the browser can fire `load` before React hydrates, which would leave the
 * logo hidden forever. Render visible + onError fallback instead.
 */
export function BrandMark({ className }: { className?: string }) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <span
        aria-hidden
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
          className
        )}
      >
        <GraduationCap className="h-5 w-5" />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- deliberate: 32px static logo, SSR-safe onError fallback
    <img
      src="/logo.jpeg"
      alt=""
      width={32}
      height={32}
      className={cn(
        "h-8 w-8 shrink-0 rounded-lg bg-surface object-cover",
        className
      )}
      onError={() => setMissing(true)}
    />
  );
}