"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

/**
 * V3 Phase D — sign out, with a confirmation dialog.
 * Logout no longer hides in corner menus: it lives only on the Profile
 * page, and one accidental tap can't end the session. The dialog is the
 * same modal language as the command palette (backdrop, scale-in,
 * Escape/backdrop close) and collapses under prefers-reduced-motion via
 * the global CSS animation guard.
 */

export function SignOutDialog() {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Escape closes. Backdrop click closes (handled on the overlay div).
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus the cancel button once the dialog mounts (rAF-deferred so the
  // focus lands after the dialog paints — same pattern as the palette).
  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => cancelRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="text-danger hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Sign out
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-title"
          aria-describedby="signout-desc"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl animate-scale-in"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="signout-title"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              Sign out of UniMate?
            </h2>
            <p id="signout-desc" className="mt-1.5 text-sm text-muted-foreground">
              You&apos;ll need to sign back in with your email and password.
              Your data stays safe — nothing is deleted.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <form action={logout}>
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-danger text-white hover:bg-danger/90"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}