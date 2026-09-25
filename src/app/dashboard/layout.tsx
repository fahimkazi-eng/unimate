import { Suspense, type ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { getOrCreateProfile } from "@/lib/queries";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PageTransition } from "@/components/dashboard/page-transition";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";

export const dynamic = "force-dynamic";

/**
 * Checkpoint 3 — the authenticated app shell.
 * Desktop: premium left sidebar (collapsible, animated active pill).
 * Mobile: existing brand + scrollable tab bar until the mobile pass (C12).
 * Pages render their own inner content; widths are preserved per page.
 *
 * PERFORMANCE: all runtime data (auth check + profile) lives inside
 * `<Suspense>` boundaries — never awaited at the top of the layout.
 * Awaiting in the layout body makes the `loading.js` fallback unable to
 * stream in until the whole layout finishes, so every dashboard navigation
 * shows the OLD page with zero feedback (bad on phones). Streaming the
 * chrome separately keeps the shared shell interactive and lets the loading
 * skeleton answer taps immediately. (Next.js docs, loading.js caveat.)
 * `requireUser`/`getOrCreateProfile` are React-`cache()`d per request, so
 * the two chrome pieces share one round trip.
 */

/** Auth-gated profile data for the shell chrome (runs inside Suspense). */
async function resolveShell() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);
  const name =
    profile?.nickname ??
    profile?.display_name ??
    (user.user_metadata.full_name as string | undefined) ??
    "student";
  return { profile, name };
}

async function SidebarAsync() {
  const { profile, name } = await resolveShell();
  return (
    <Sidebar
      name={name}
      level={profile?.level ?? 1}
      xp={profile?.xp ?? 0}
      photoUrl={profile?.photo_url ?? null}
    />
  );
}

async function MobileHeaderAsync() {
  const { profile, name } = await resolveShell();
  return <MobileHeader name={name} photoUrl={profile?.photo_url ?? null} />;
}

/** Placeholder matching the real sidebar footprint so streaming never shifts layout. */
function SidebarFallback() {
  return (
    <aside
      aria-hidden
      className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex"
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted/70" />
      </div>
      <div className="flex-1 space-y-2 px-2 py-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-muted/60" />
        ))}
      </div>
    </aside>
  );
}

/** Placeholder matching the sticky mobile bar footprint. */
function MobileHeaderFallback() {
  return (
    <header
      aria-hidden
      className="sticky top-0 z-30 border-b border-border bg-surface pt-[env(safe-area-inset-top)] lg:hidden"
    >
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg"
      >
        Skip to content
      </a>

      <Suspense fallback={<SidebarFallback />}>
        <SidebarAsync />
      </Suspense>

      {/* Cmd/K command palette — available on every app page */}
      <CommandPalette />

      <div className="min-w-0 flex-1">
        {/* Sticky mobile header — desktop uses the sidebar instead */}
        <Suspense fallback={<MobileHeaderFallback />}>
          <MobileHeaderAsync />
        </Suspense>

        <main
          id="main-content"
          className="w-full scroll-mt-20 px-4 pb-28 pt-4 sm:px-6 lg:pb-10 lg:pt-8"
        >
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Checkpoint 12 — mobile bottom navigation (desktop uses the sidebar) */}
      <MobileBottomNav />
    </div>
  );
}