import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";

/**
 * Responsive pass — the sticky mobile shell header.
 *
 * Left: brand mark + wordmark. Right: profile avatar (≥44px tap target,
 * the only place account actions live is Profile, so it links there).
 * Solid surface (no backdrop-blur) so the bar is one cheap paint on phone
 * GPUs, safe-area top respected for notched devices, `lg:hidden` — desktop
 * keeps the sidebar and never sees this bar.
 */

interface MobileHeaderProps {
  name: string;
  photoUrl?: string | null;
}

export function MobileHeader({ name, photoUrl }: MobileHeaderProps) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface pt-[env(safe-area-inset-top)] lg:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link
          href="/dashboard"
          aria-label="UniMate — overview"
          className="flex min-w-0 items-center gap-2 font-semibold text-foreground"
        >
          <BrandMark className="shadow-glow-primary" />
          <span className="truncate text-sm">UniMate</span>
        </Link>

        <Link
          href="/dashboard/profile"
          aria-label="Open your profile"
          className="-mr-2 flex h-11 min-w-11 items-center justify-center rounded-lg p-1 transition-colors hover:bg-muted"
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- user photo, small avatar
            <img
              src={photoUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-border"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground"
            >
              {initials || <GraduationCap className="h-4 w-4" />}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}