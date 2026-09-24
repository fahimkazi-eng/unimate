import Link from "next/link";
import {
  CalendarPlus2,
  CalendarRange,
  ListPlus,
  Play,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * V3 Phase A §6 — the quick-action command bar.
 * Mobile: horizontally scrollable rail. Desktop: a compact command bar.
 * Every target is a real link with the global press-feedback (transform
 * scale in globals.css) and a subtle icon lift on hover — instant-feel,
 * no JS, no timers.
 */

interface QuickAction {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Short caption shown on larger screens. */
  caption: string;
}

const ACTIONS: QuickAction[] = [
  { href: "/dashboard/tasks", label: "Add Task", icon: ListPlus, caption: "Capture a task" },
  { href: "/dashboard/calendar", label: "Add Event", icon: CalendarPlus2, caption: "Block time" },
  { href: "/dashboard/focus", label: "Start Focus", icon: Play, caption: "Begin a session" },
  { href: "/dashboard/assistant", label: "Ask UniMate", icon: Sparkles, caption: "Chat with your coach" },
  { href: "/dashboard/planner", label: "Plan My Week", icon: CalendarRange, caption: "Spread the workload" },
];

export function QuickActions() {
  return (
    <section aria-label="Quick actions">
      {/* Mobile: horizontal scroll rail */}
      <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex min-w-[150px] snap-start items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-[transform,background-color,border-color] duration-200 ease-out-quart hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-elevated sm:min-w-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-transform duration-200 ease-out-quart group-hover:scale-110">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {action.label}
                </span>
                <span className="hidden truncate text-xs text-muted-foreground sm:block">
                  {action.caption}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}