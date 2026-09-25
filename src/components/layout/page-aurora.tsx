/**
 * Global atmosphere layer — rendered once in the root layout so the whole
 * app (landing, auth, dashboard) sits on the UniMate Deep Space base:
 * a slow-drifting gradient mesh + three ambient glow orbs.
 *
 * Performance rules (visual overhaul):
 *  - Fixed layer, `-z-10`, pointer-events-none: zero interaction cost.
 *  - Orbs are blurred *radial gradients* (soft falloff), not filter:blur,
 *    so there is no per-frame blur work.
 *  - Motion is transform/opacity only (drift/aurora keyframes).
 *  - Mobile drops the peripheral orbs + full mesh (globals.css media rule
 *    already hides .animate-drift-2/3; the mesh simplifies there too).
 *  - prefers-reduced-motion collapses everything globally in globals.css.
 */
export function PageAurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Gradient mesh — full page, simplfied on phones */}
      <div
        className="absolute inset-0 animate-mesh-drift will-change-transform [transform-origin:50%_40%]"
        style={{
          background:
            "radial-gradient(48% 40% at 15% 10%, rgb(124 58 237 / 0.13), transparent 70%)," +
            "radial-gradient(40% 34% at 85% 6%, rgb(34 211 238 / 0.09), transparent 70%)," +
            "radial-gradient(50% 44% at 72% 92%, rgb(236 72 153 / 0.09), transparent 72%)," +
            "radial-gradient(36% 32% at 6% 84%, rgb(99 102 241 / 0.12), transparent 70%)",
        }}
      />

      {/* Top violet glow */}
      <div
        className="absolute inset-x-0 top-0 h-[420px] animate-aurora"
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 50% -12%, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 70%)",
        }}
      />

      {/* Drifting glue orbs — transform-only */}
      <div
        className="absolute -left-32 top-1/4 h-[520px] w-[520px] animate-drift-1 rounded-full max-md:hidden"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, #8b5cf6 18%, transparent) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute -right-40 top-1/2 h-[560px] w-[560px] animate-drift-2 rounded-full max-md:hidden"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, #38bdf8 12%, transparent) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[480px] w-[480px] animate-drift-3 rounded-full max-md:hidden"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, #ec4899 11%, transparent) 0%, transparent 68%)",
        }}
      />
    </div>
  );
}