"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  CalendarClock,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  Search,
  Settings,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { BrandMark } from "@/components/brand/brand-mark";
import { openCommandPalette } from "@/components/dashboard/command-palette";

/**
 * App shell sidebar — Checkpoint 3.
 * Animated active pill slides between items (transform-only, GPU friendly),
 * collapses to icons with hover tooltips, account area pinned at the bottom.
 */

/** One nav item = 40px (h-10) + 4px gap (gap-1) between items. */
const ITEM_STEP = 44;

interface SidebarItem {
  href?: string;
  label: string;
  icon: LucideIcon;
}

/** Live routes. */
const mainItems: SidebarItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/planner", label: "Planner", icon: CalendarClock },
  { href: "/dashboard/focus", label: "Focus", icon: Timer },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/dashboard/assistant", label: "Assistant", icon: Sparkles },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

/** Planned features — visible but honestly marked (no dead links). */
const plannedItems: SidebarItem[] = [
  { label: "Notes", icon: NotebookPen },
  { label: "Settings", icon: Settings },
];

const COLLAPSE_KEY = "unimate:sidebar-collapsed";

function isActive(href: string | undefined, pathname: string): boolean {
  if (!href) return false;
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

/** Label bubble shown when the sidebar is collapsed. */
function CollapsedTooltip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-surface-elevated px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
    >
      {label}
    </span>
  );
}

export interface SidebarProps {
  name: string;
  level: number;
  xp: number;
  photoUrl?: string | null;
}

export function Sidebar({ name, level, xp, photoUrl }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Persisted collapsed preference (read after mount to avoid hydration drift).
  useEffect(() => {
    if (window.localStorage.getItem(COLLAPSE_KEY) === "1") {
      setCollapsed(true);
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      window.localStorage.setItem(COLLAPSE_KEY, v ? "0" : "1");
      return !v;
    });
  };

  const activeIndex = mainItems.findIndex((item) =>
    isActive(item.href, pathname)
  );

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-300 ease-out-quart lg:flex",
        collapsed ? "w-[72px]" : "w-64"
      )}
      aria-label="App sidebar"
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "px-4"
        )}
      >
        <Link
          href="/dashboard"
          aria-label="UniMate — overview"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <BrandMark className="shadow-glow-primary" />
          {!collapsed && <span className="text-sm">UniMate</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto py-4">
        <button
          type="button"
          onClick={openCommandPalette}
          className={cn(
            "group mb-3 flex h-10 items-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed ? "w-full justify-center" : "gap-3 px-3"
          )}
          aria-label="Open command palette"
        >
          <Search className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && (
            <>
              <span className="truncate">Jump to…</span>
              <kbd className="ml-auto shrink-0 rounded border border-border bg-surface-elevated px-1.5 py-0.5 text-[10px] font-medium">
                ⌘K
              </kbd>
            </>
          )}
        </button>
        {/* Live routes — animated active pill */}
        <ul className="relative flex flex-col gap-1 px-2" aria-label="Main">
          {activeIndex >= 0 && (
            <li
              aria-hidden
              className="pointer-events-none absolute inset-x-2 top-0 h-10 rounded-lg bg-primary-soft shadow-glow-primary transition-transform duration-300 ease-out-quart"
              style={{ transform: `translateY(${activeIndex * ITEM_STEP}px)` }}
            />
          )}

          {mainItems.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <li key={item.label} className="group relative">
                <Link
                  href={item.href!}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative z-10 flex h-10 items-center rounded-lg text-sm font-medium transition-colors",
                    collapsed ? "justify-center" : "gap-3 px-3",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-transform duration-200 ease-out-quart group-hover:scale-110",
                      active && "text-primary"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {collapsed && <CollapsedTooltip label={item.label} />}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Planned features — honestly marked, not linked */}
        <div className="mx-5 my-3 h-px bg-border" aria-hidden />
        <ul className="flex flex-col gap-1 px-2" aria-label="Coming soon">
          {plannedItems.map((item) => (
            <li key={item.label} className="group relative">
              <span
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex h-10 items-center rounded-lg text-sm font-medium text-muted-foreground",
                  collapsed ? "justify-center" : "gap-3 px-3"
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0 opacity-60" />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Soon
                    </span>
                  </>
                )}
                {collapsed && <CollapsedTooltip label={item.label} />}
              </span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer — collapse toggle + account */}
      <div className="shrink-0 border-t border-border p-2">
        <div
          className={cn(
            "mb-2 flex",
            collapsed ? "justify-center" : "justify-end"
          )}
        >
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <AccountMenu
          name={name}
          level={level}
          xp={xp}
          photoUrl={photoUrl}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}