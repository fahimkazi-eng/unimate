/**
 * Instant loading skeleton for every dashboard route (Tasks, Overview, …).
 *
 * `app/dashboard/loading.tsx` wraps each page in a Suspense fallback that the
 * router can show IMMEDIATELY on navigation — the app answers the tap instead
 * of sitting silently while the RSC payload (auth + queries + cold start)
 * streams in. Pure static shapes + `animate-pulse`; no motion beyond opacity,
 * and the global reduced-motion rule collapses the pulse to a static block.
 */

export default function DashboardLoading() {
  return (
    <div
      aria-hidden
      className="mx-auto max-w-4xl select-none"
      aria-busy="true"
    >
      {/* Page header placeholder */}
      <div className="animate-pulse">
        <div className="h-7 w-40 rounded-md bg-muted" />
        <div className="mt-2 h-4 w-64 max-w-full rounded-md bg-muted/70" />
      </div>

      {/* Placeholder cards */}
      <div className="mt-6 space-y-6">
        <div className="animate-pulse rounded-xl border border-border bg-surface p-5">
          <div className="h-4 w-36 rounded-md bg-muted" />
          <div className="mt-3 h-3 w-56 max-w-full rounded-md bg-muted/60" />
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted/80" />
            <div className="h-10 flex-1 rounded-lg bg-muted/50" />
          </div>
        </div>

        <div className="animate-pulse rounded-xl border border-border bg-surface p-5">
          <div className="h-4 w-24 rounded-md bg-muted" />
          <div className="mt-4 space-y-3">
            <div className="h-12 rounded-lg bg-muted/50" />
            <div className="h-12 rounded-lg bg-muted/50" />
            <div className="h-12 rounded-lg bg-muted/50" />
          </div>
        </div>
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}