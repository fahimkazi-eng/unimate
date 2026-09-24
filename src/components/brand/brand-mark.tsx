"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * V2 Phase 2 — the single source of truth for the UniMate brand mark.
 *
 * Renders `public/logo.svg` whenever the asset is present (hidden while it
 * loads, so there's never a broken-image flash). Until the asset exists it
 * draws the graduation-cap placeholder — the current brand treatment — so
 * the app looks identical today.
 *
 * Drop the real brand file at `public/logo.svg` and every surface (navbar,
 * footer, auth pages, sidebar, mobile header) upgrades at once; no component
 * changes needed. Consistency of proportions/colors/glow lives here, in one
 * place (spec 4).
 */
export function BrandMark({ className }: { className?: string }) {
  const [state, setState] = useState<"unknown" | "ok" | "missing">("unknown");

  if (state === "ok") {
    return (
      <img
        src="/logo.svg"
        alt=""
        width={32}
        height={32}
        className={cn("h-8 w-8 shrink-0 rounded-lg", className)}
        onError={() => setState("missing")}
      />
    );
  }

  return (
    <>
      {state === "unknown" ? (
        <img
          src="/logo.svg"
          alt=""
          width={32}
          height={32}
          className="hidden"
          onLoad={() => setState("ok")}
          onError={() => setState("missing")}
        />
      ) : null}
      <span
        aria-hidden
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
          className
        )}
      >
        <GraduationCap className="h-5 w-5" />
      </span>
    </>
  );
}