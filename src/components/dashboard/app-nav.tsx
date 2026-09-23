"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/courses", label: "Courses" },
  { href: "/dashboard/focus", label: "Focus" },
  { href: "/dashboard/progress", label: "Progress" },
];

/** Top-level nav shared by app pages. Grows with each new phase. */
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex items-center gap-1 overflow-x-auto border-b border-border pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
    </nav>
  );
}