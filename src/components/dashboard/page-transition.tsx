"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Subtle fade-in for the app shell's content area on every route change.
 * Keyed by pathname so each page replay's the entrance exactly once,
 * and the sidebar (outside this wrapper) stays mounted and untouched.
 * V2 Phase 1 (spec 6): uses the 180ms fade — navigation should feel
 * instant, never like the app is "thinking".
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in-fast">
      {children}
    </div>
  );
}