"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/courses", label: "Courses" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/focus", label: "Focus" },
  { href: "/dashboard/goals", label: "Goals" },
  { href: "/dashboard/progress", label: "Progress" },
  { href: "/dashboard/achievements", label: "Achievements" },
];

/** Top-level nav shared by app pages: brand mark + scrollable tab row. */
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8">
      <div className="flex items-center gap-3 border-b border-border pb-2">
        <Link
          href="/dashboard"
          aria-label="UniMate — overview"
          className="flex shrink-0 items-center gap-2 font-semibold text-foreground"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className="hidden text-sm md:inline">UniMate</span>
        </Link>

        <div className="flex flex-1 items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
                  active
                    ? "bg-surface text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}