/**
 * Ambient animated background for the homepage hero — visual overhaul.
 * Deep Space base + a slow-drifting gradient mesh and theme-aware
 * violet/indigo/cyan/pink glow orbs (colors via color-mix, no hard-coded
 * hex on surfaces), motion is slow transform drift / opacity only
 * (compositor-friendly), and reduced motion collapses everything globally
 * in `globals.css`. Phones keep the center glow only.
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
            "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 70%)",
        }}
      />

      {/* Slow-drifting gradient mesh (static image, transform-only motion) */}
      <div className="absolute inset-0 mesh-overlay animate-mesh-drift will-change-transform" />

      {/* Drifting glow orbs — transform-only animation */}
      <div
        className="absolute -top-24 left-1/2 h-[540px] w-[540px] -translate-x-1/2 animate-drift-1 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-primary) 26%, transparent) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute -left-40 top-1/3 h-[440px] w-[440px] animate-drift-2 rounded-full max-md:hidden"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 20%, transparent) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute -right-40 top-2/3 h-[480px] w-[480px] animate-drift-3 rounded-full max-md:hidden"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, rgb(34 211 238 / 1) 18%, transparent) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute -right-24 top-16 hidden h-[360px] w-[360px] animate-drift-1 rounded-full lg:block [animation-delay:-3s]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, rgb(236 72 153 / 1) 16%, transparent) 0%, transparent 68%)",
        }}
      />
    </div>
  );
}