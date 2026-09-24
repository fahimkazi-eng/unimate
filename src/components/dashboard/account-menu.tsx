"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronUp,
  GraduationCap,
  LogOut,
  Palette,
  Settings,
  UserRound,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

export interface AccountMenuProps {
  name: string;
  level: number;
  xp: number;
  /** Reserved for Checkpoint 9 (Google photo / uploads). */
  photoUrl?: string | null;
  collapsed?: boolean;
}

function Avatar({
  initials,
  photoUrl,
}: {
  initials: string;
  photoUrl?: string | null;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote photo comes in Checkpoint 9
      <img
        src={photoUrl}
        alt=""
        className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-border"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground"
    >
      {initials || <GraduationCap className="h-4 w-4" />}
    </span>
  );
}

const soonItems = [
  { icon: UserRound, label: "Profile" },
  { icon: Settings, label: "Settings" },
  { icon: Palette, label: "Appearance" },
];

/** Premium account area at the bottom of the app shell. */
export function AccountMenu({
  name,
  level,
  xp,
  photoUrl,
  collapsed,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={collapsed ? name : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-2 transition-colors",
          "hover:border-border-hover hover:bg-muted",
          collapsed && "justify-center"
        )}
      >
        <Avatar initials={initials} photoUrl={photoUrl} />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-medium text-foreground">
                {name}
              </span>
              <span className="block text-xs text-muted-foreground">
                Level {level} · {xp} XP
              </span>
            </span>
            <ChevronUp
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-xl border border-border bg-surface-elevated p-1.5 shadow-lg"
        >
          <p className="px-3 pb-1 pt-2 text-xs font-medium text-foreground">
            {name}
            <span className="ml-1.5 text-muted-foreground">
              Level {level} · {xp} XP
            </span>
          </p>

          {soonItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                Soon
              </span>
            </div>
          ))}

          <div className="my-1 h-px bg-border" />

          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}