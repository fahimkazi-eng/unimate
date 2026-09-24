"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MoreHorizontal,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Checkpoint 12 — mobile bottom navigation.
 * Five primary destinations + a "More" sheet for the long tail (and logout,
 * which desktop gets from the sidebar). Fixed bar with safe-area padding;
 * every target is ≥ 44px. Desktop (lg+) is untouched — the sidebar owns it.
 */

const PRIMARY = [
  { href: "/dashboard", label: "Overview", icon: GraduationCap },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/focus", label: "Focus", icon: Timer },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
];

const MORE = [
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

function isActive(href: string, pathname: string): boolean {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = MORE.some((item) => isActive(item.href, pathname));

  return (
    <>
      {/* More sheet */}
      {moreOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="More pages"
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" aria-hidden />
          <div
            className="absolute inset-x-3 bottom-24 rounded-2xl border border-border bg-surface p-2 shadow-2xl animate-scale-in"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              More pages
            </p>

            {MORE.map((item) => {
              const active = isActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-soft text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", active && "text-primary")} />
                  {item.label}
                  {active ? <span className="ml-auto text-xs text-primary">Here</span> : null}
                </Link>
              );
            })}

            <form action={logout} className="mt-1 border-t border-border pt-1">
              <button
                type="submit"
                className="flex h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* Bottom bar */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className="flex items-stretch">
          {PRIMARY.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {active ? (
                  <span
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
                    aria-hidden
                  />
                ) : null}
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            aria-label="More pages"
            className={cn(
              "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
              moreActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            {moreActive ? (
              <span
                className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
                aria-hidden
              />
            ) : null}
            <MoreHorizontal className="h-5 w-5" />
            More
          </button>
        </div>
      </nav>
    </>
  );
}