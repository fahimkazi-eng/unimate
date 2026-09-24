/**
 * Motion utilities — Checkpoint 5.
 *
 * The animation *values* (easings, durations) live as tokens in
 * `globals.css`; these helpers only produce CSP-safe inline values that
 * stagger entrances. All motion stays on transform/opacity so the
 * compositor handles it. `prefers-reduced-motion` is neutralized globally
 * in CSS.
 */

/** Base step (ms) between staggered items. */
const DEFAULT_STEP_MS = 60;

/**
 * `animation-delay` value for the nth item in a staggered group.
 * Example: `style={{ animationDelay: staggerDelay(2) }}` → "120ms".
 */
export function staggerDelay(index: number, stepMs = DEFAULT_STEP_MS): string {
  return `${Math.max(0, index) * stepMs}ms`;
}

/**
 * Client-only check for `prefers-reduced-motion`. CSS collapses transitions
 * globally, but JS-driven demo loops need this to skip their timers entirely
 * and show a static, complete state instead.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}