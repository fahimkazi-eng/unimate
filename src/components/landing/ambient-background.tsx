/**
 * Ambient animated background for the homepage hero — Checkpoint 6.
 * Theme-aware indigo/purple glow orbs. Colors come from tokens via
 * `color-mix` (no hard-coded hex), motion is slow transform drift only
 * (compositor-friendly), and reduced motion collapses everything globally
 * in `globals.css`.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-background"
    >
      {/* Soft top vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 70%)",
        }}
      />

      {/* Drifting glow orbs — transform-only animation */}
      <div
        className="absolute -top-24 left-1/2 h-[540px] w-[540px] -translate-x-1/2 animate-drift-1 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-primary) 24%, transparent) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute -left-40 top-1/3 h-[440px] w-[440px] animate-drift-2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 18%, transparent) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute -right-40 top-2/3 h-[480px] w-[480px] animate-drift-3 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-primary-light) 16%, transparent) 0%, transparent 68%)",
        }}
      />
    </div>
  );
}