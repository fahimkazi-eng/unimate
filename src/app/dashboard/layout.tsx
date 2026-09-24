import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { getOrCreateProfile } from "@/lib/queries";
import { AppNav } from "@/components/dashboard/app-nav";
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
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);

  const name =
    profile?.nickname ??
    profile?.display_name ??
    (user.user_metadata.full_name as string | undefined) ??
    "student";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg"
      >
        Skip to content
      </a>

      <Sidebar
        name={name}
        level={profile?.level ?? 1}
        xp={profile?.xp ?? 0}
        photoUrl={profile?.photo_url ?? null}
      />

      {/* Cmd/K command palette — available on every app page */}
      <CommandPalette />

      <div className="min-w-0 flex-1">
        {/* Mobile shell until C12 — desktop uses the sidebar instead */}
        <div className="lg:hidden">
          <AppNav />
        </div>

        <main id="main-content" className="w-full scroll-mt-4 px-4 pb-28 pt-10 sm:px-6 lg:pb-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Checkpoint 12 — mobile bottom navigation (desktop uses the sidebar) */}
      <MobileBottomNav />
    </div>
  );
}