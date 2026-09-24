import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { getOrCreateProfile } from "@/lib/queries";
import { AppNav } from "@/components/dashboard/app-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PageTransition } from "@/components/dashboard/page-transition";

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
    profile?.display_name ??
    (user.user_metadata.full_name as string | undefined) ??
    "student";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        name={name}
        level={profile?.level ?? 1}
        xp={profile?.xp ?? 0}
      />

      <div className="min-w-0 flex-1">
        {/* Mobile shell until C12 — desktop uses the sidebar instead */}
        <div className="lg:hidden">
          <AppNav />
        </div>

        <main className="w-full px-4 py-10 sm:px-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}