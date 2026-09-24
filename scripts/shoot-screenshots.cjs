// UniMate screenshot tool — Checkpoint 14.
// Drives the locally-installed Chrome (no browser download) via
// playwright-core and captures the current design (dark theme) into
// public/screenshots.
//
// Usage:
//   BASE_URL=http://localhost:3000 npm run screenshots
//
// Public shots (homepage / auth pages) need no session. To re-shoot the
// dashboard pages you must first log in to the running dev server from a
// normal Chrome window and pass the Supabase session cookie:
//   UNIMATE_SESSION="sb-fixyivqquofguiqorctk-auth-token=<value>" \
//   npm run screenshots -- --dashboard
//
// The cookie value can be copied from DevTools → Application → Cookies
// (filter "supabase" / "sb-").

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.join(process.cwd(), "public", "screenshots");
const SESSION_COOKIE = process.env.UNIMATE_SESSION || "";
const DASHBOARD = process.argv.includes("--dashboard");
const KS = { waitUntil: "networkidle", timeout: 60_000 };

const PUBLIC = [
  { name: "home-hero.png", url: `${BASE}/`, full: false },
  { name: "coach-demo.png", url: `${BASE}/`, selector: "#coach-demo" },
  { name: "login.png", url: `${BASE}/login`, full: false },
  { name: "signup.png", url: `${BASE}/signup`, full: false },
  { name: "check-email.png", url: `${BASE}/check-email`, full: false },
];

const DASH = [
  { name: "dashboard.png", url: `${BASE}/dashboard`, full: false },
  { name: "tasks.png", url: `${BASE}/dashboard/tasks`, full: false },
  { name: "courses.png", url: `${BASE}/dashboard/courses`, full: false },
  { name: "calendar.png", url: `${BASE}/dashboard/calendar`, full: false },
  { name: "academics.png", url: `${BASE}/dashboard/academics`, full: false },
  { name: "planner.png", url: `${BASE}/dashboard/planner`, full: false },
  { name: "focus.png", url: `${BASE}/dashboard/focus`, full: false },
  { name: "progress.png", url: `${BASE}/dashboard/progress`, full: false },
  { name: "goals.png", url: `${BASE}/dashboard/goals`, full: false },
  { name: "achievements.png", url: `${BASE}/dashboard/achievements`, full: false },
  { name: "emergency.png", url: `${BASE}/dashboard/emergency`, full: false },
  { name: "assistant.png", url: `${BASE}/dashboard/assistant`, full: false },
  { name: "profile.png", url: `${BASE}/dashboard/profile`, full: false },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  if (DASHBOARD) {
    if (!SESSION_COOKIE) {
      console.error("--dashboard requires UNIMATE_SESSION (see header).");
      process.exit(1);
    }
    const [name, value] = SESSION_COOKIE.split("=");
    await ctx.addCookies([
      { name, value, url: BASE, path: "/", sameSite: "Lax" },
    ]);
  }

  const page = await ctx.newPage();
  // Reduce motion collapses every entrance/drift animation (the real
  // prefers-reduced-motion path in globals.css) so captures are stable.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const shots = DASHBOARD ? DASH : PUBLIC;

  for (const s of shots) {
    await page.goto(s.url, KS);
    // Let the reveal-on-intersect observer settle.
    await page.waitForTimeout(1500);
    if (s.selector) {
      const el = page.locator(s.selector);
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await el.screenshot({ path: path.join(OUT, s.name) });
    } else {
      await page.screenshot({ path: path.join(OUT, s.name), fullPage: s.full });
    }
    console.log(`shot ${s.name}`);
  }

  await browser.close();
  console.log(`Done — screenshots in ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});