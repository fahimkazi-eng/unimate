"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  GraduationCap,
  ListChecks,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Checkpoint 11 — Cmd/Ctrl+K command palette.
 * Full keyboard nav: ↑↓ move, Enter open, Esc close, click outside closes.
 * Animations are simple fade/scale (GPU-friendly) and collapse globally
 * under prefers-reduced-motion.
 */

const OPEN_EVENT = "unimate:open-palette";

/** Open the palette from anywhere (used by the sidebar trigger). */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: typeof ListChecks;
  keywords: string;
}[] = [
  { href: "/dashboard", label: "Overview", icon: GraduationCap, keywords: "home dashboard start" },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks, keywords: "todo todo list deadlines work" },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen, keywords: "classes subjects modules" },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays, keywords: "schedule month due dates plan" },
  { href: "/dashboard/focus", label: "Focus", icon: Timer, keywords: "timer pomodoro study session" },
  { href: "/dashboard/goals", label: "Goals", icon: Target, keywords: "targets objectives targets" },
  { href: "/dashboard/progress", label: "Progress", icon: BarChart3, keywords: "stats analytics charts xp" },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy, keywords: "badges awards unlocks" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Global shortcuts: ⌘K / Ctrl+K toggles, Esc always closes. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((wasOpen) => !wasOpen);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) =>
      `${item.label} ${item.keywords}`.toLowerCase().includes(q)
    );
  }, [query]);

  /* Focus + reset whenever the palette opens. */
  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, items.length - 1)));
  }, [items.length]);

  if (!open) return null;

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[index];
      if (item) go(item.href);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-24 backdrop-blur-sm animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-scale-in"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Jump to a page…"
            aria-label="Search pages"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={
              items[index] ? `palette-option-${index}` : undefined
            }
            className="h-12 w-full rounded-md bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <kbd className="shrink-0 rounded border border-border bg-surface-elevated px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <ul
          id="palette-list"
          role="listbox"
          aria-label="Pages"
          className="max-h-72 overflow-y-auto p-2"
        >
          {items.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              No pages match “{query}”.
            </li>
          ) : (
            items.map((item, i) => (
              <li
                key={item.href}
                id={`palette-option-${i}`}
                role="option"
                aria-selected={i === index}
                onMouseEnter={() => setIndex(i)}
                onClick={() => go(item.href)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  i === index
                    ? "bg-primary-soft text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon
                  className={cn("h-4 w-4", i === index && "text-primary")}
                />
                {item.label}
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <span>↑↓ navigate · Enter open · Esc close</span>
          <span>⌘K anywhere</span>
        </div>
      </div>
    </div>
  );
}