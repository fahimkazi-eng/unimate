import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard — Campus Hub",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const name = (user.user_metadata.full_name as string) ?? "student";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              Good to see you, {name} 👋
            </h1>
            <Badge variant="success">Auth live</Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            Your dashboard — courses, tasks, focus sessions and progress — is
            the next phase. Auth works end to end.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-10 rounded-xl border border-dashed border-border bg-surface p-10 text-center">
        <p className="text-sm text-muted-foreground">
          📌 <span className="font-medium text-foreground">Phase 5 preview:</span>{" "}
          personalized greeting, next deadline, today&apos;s tasks, semester
          progress and study stats land here.
        </p>
      </div>
    </main>
  );
}