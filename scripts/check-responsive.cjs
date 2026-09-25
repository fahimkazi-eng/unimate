// UniMate responsive audit — spec §38 widths.
// Drives the locally-installed Chrome (like shoot-screenshots.cjs) and checks
// every target width for horizontal overflow on the public pages. Reports the
// first offending elements per page/width (elements inside scrollable rails
// are legitimate and skipped).
//
// Usage:
//   BASE_URL=http://localhost:3000 npm run responsive:check
//
// To also audit the dashboard routes (needs a logged-in session cookie):
//   UNIMATE_SESSION="sb-...-auth-token=<value>" \
//   npm run responsive:check -- --dashboard
//
// Exit code is non-zero when any page overflows at any width.

const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const SESSION_COOKIE = process.env.UNIMATE_SESSION || "";
const DASHBOARD = process.argv.includes("--dashboard");
const KS = { waitUntil: "networkidle", timeout: 60_000 };

// Spec §38 — the full test ladder, every breakpoint that matters.
const WIDTHS = [320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440];

const PUBLIC = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/check-email",
];

const DASH = [
  "/dashboard",
  "/dashboard/tasks",
  "/dashboard/courses",
  "/dashboard/calendar",
  "/dashboard/academics",
  "/dashboard/planner",
  "/dashboard/focus",
  "/dashboard/progress",
  "/dashboard/goals",
  "/dashboard/achievements",
  "/dashboard/emergency",
  "/dashboard/assistant",
  "/dashboard/profile",
];

async function auditPage(page, url, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(url, KS);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(400);

  return page.evaluate((w) => {
    const root = document.documentElement;
    const offenders = [];
    if (root.scrollWidth <= w) return { width: w, ok: true, scrollWidth: root.scrollWidth };

    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > w + 1 || r.left < -1)) {
        let parent = el.parentElement;
        let insideRail = false;
        let clipped = false;
        while (parent) {
          const cs = getComputedStyle(parent);
          // Clipped by an overflow:hidden/clip ancestor — contributes nothing
          // to the document width (decorative glows, rounded-corner bleed).
          if (cs.overflowX === "hidden" || cs.overflowX === "clip" ||
              cs.overflowY === "hidden" || cs.overflowY === "clip") {
            clipped = true;
            break;
          }
          // Legitimate: anything inside a horizontal scroll container.
          if (
            (cs.overflowX === "auto" || cs.overflowX === "scroll") &&
            parent.getBoundingClientRect().width <= w
          ) {
            insideRail = true;
            break;
          }
          parent = parent.parentElement;
        }
        if (!insideRail && !clipped) {
          offenders.push({
            tag: el.tagName,
            cls: String(el.className || "").slice(0, 80),
            left: Math.round(r.left),
            right: Math.round(r.right),
          });
        }
      }
    }
    return { width: w, ok: false, scrollWidth: root.scrollWidth, offenders: offenders.slice(0, 5) };
  }, width);
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  if (DASHBOARD) {
    if (!SESSION_COOKIE) {
      console.error("--dashboard requires UNIMATE_SESSION (see header).");
      process.exit(1);
    }
    const [name, value] = SESSION_COOKIE.split("=");
    await ctx.addCookies([{ name, value, url: BASE, sameSite: "Lax" }]);
  }

  const page = await ctx.newPage();
  const pages = DASHBOARD ? DASH : PUBLIC;
  let failures = 0;

  for (const route of pages) {
    const url = `${BASE}${route}`;
    for (const width of WIDTHS) {
      const res = await auditPage(page, url, width);
      if (!res.ok) {
        failures += 1;
        console.log(`OVERFLOW ${route} @${width}px  scrollWidth=${res.scrollWidth}`);
        for (const o of res.offenders) {
          console.log(`   <${o.tag}> ${o.cls || "(no class)"} [${o.left}..${o.right}]`);
        }
      }
    }
    console.log(`checked ${route} @ ${WIDTHS.join("/")}px`);
  }

  await browser.close();
  if (failures > 0) {
    console.error(`\n${failures} overflow(s) found.`);
    process.exit(1);
  }
  console.log("\nAll widths clean — no horizontal overflow.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});