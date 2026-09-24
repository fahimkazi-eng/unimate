"use client";

import { useEffect, useState } from "react";
import { CircleUserRound, KeyRound, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

const METHODS = [
  { label: "Continue with Google", icon: "G", kind: "google" },
  { label: "Sign in with email", icon: "mail", kind: "email" },
];

/**
 * Auth demo — the two sign-in paths cycling which one is "active".
 * Google requires a configured provider (see README) — the real pages
 * handle both honestly.
 */
export function DemoAuth() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setActive((a) => (a + 1) % METHODS.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full space-y-1.5">
      {METHODS.map((method, index) => (
        <div
          key={method.label}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors duration-300",
            index === active
              ? "border-primary/40 bg-surface text-foreground"
              : "border-border bg-background text-muted-foreground"
          )}
        >
          {method.kind === "google" ? (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-bold text-foreground">
              G
            </span>
          ) : (
            <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
          )}
          <span className="truncate">{method.label}</span>
          {index === active && (
            <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
              <KeyRound className="h-2.5 w-2.5" />
              Active
            </span>
          )}
        </div>
      ))}

      <p className="flex items-center gap-1.5 pt-0.5 text-[10px] text-muted-foreground">
        <CircleUserRound className="h-3 w-3" />
        Your profile syncs automatically.
      </p>
    </div>
  );
}