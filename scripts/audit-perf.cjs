// UniMate mobile performance audit.
// Drives the locally-installed Chrome (like check-responsive.cjs) against a
// running server and measures what a phone actually downloads for every route:
// transferred bytes per resource type (gzip applied), request count, and
// DOMContentLoaded/load timing. Nothing is judged — it reports, so regressions
// are visible between runs.
//
// Usage (run the production server first: `npm run build && npm run start`):
//   BASE_URL=http://localhost:3000 npm run perf:audit
//
// Dashboard routes need a logged-in session cookie:
//   UNIMATE_SESSION="sb-...-auth-token=<value>" npm run perf:audit -- --dashboard
//
// Exit code is 1 only on a hard failure (server unreachable), not on "slow" —
// this is a measurement tool, not a gate.

const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const SESSION_COOKIE = process.env.UNIMATE_SESSION || "";
const DASHBOARD = process.argv.includes("--dashboard");

// Phones we care about first; desktop widths for contrast.
const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];

const PUBLIC = ["/", "/login", "/signup", "/forgot-password", "/check-email"];

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

// CDP reports capitalized resource types ("Document", "Stylesheet", ...).
const TYPE = {
  Document: "html",
  Stylesheet: "css ",
  Script: "js  ",
  Font: "font",
  Image: "img ",
  Media: "vid ",
  Fetch: "rsc ",
  XHR: "api ",
  Other: "?   ",
};

async function auditRoute(page, client, url) {
  const resources = [];
  const byId = new Map();

  const onResponse = (params) => {
    const resp = params.response;
    byId.set(params.requestId, {
      type: TYPE[params.type] || "?   ",
      url: resp.url,
      size: 0,
    });
  };
  const onFinished = (params) => {
    const r = byId.get(params.requestId);
    if (r) r.size = params.encodedDataLength || 0;
  };

  client.on("Network.responseReceived", onResponse);
  client.on("Network.loadingFinished", onFinished);
  await client.send("Network.enable");

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  } catch {
    // Page may keep long-polling (assistant etc.) — accept load as reached.
  }

  const timings = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    return {
      dcl: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      load: Math.round(nav.loadEventEnd - nav.startTime),
    };
  });

  client.off("Network.responseReceived", onResponse);
  client.off("Network.loadingFinished", onFinished);

  for (const r of byId.values()) if (r.size > 0) resources.push(r);

  const total = resources.reduce((s, r) => s + r.size, 0);
  const byType = {};
  for (const t of new Set(Object.values(TYPE))) byType[t] = 0;
  for (const r of resources) byType[r.type] += r.size;

  const heavy = [...resources].sort((a, b) => b.size - a.size).slice(0, 5);

  return {
    url,
    requests: resources.length,
    total,
    byType,
    dcl: timings.dcl,
    load: timings.load,
    heavy,
  };
}

function fmt(kb) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  if (DASHBOARD && !SESSION_COOKIE) {
    console.error("--dashboard requires UNIMATE_SESSION (see header).");
    process.exit(1);
  }
  const cookie = SESSION_COOKIE ? SESSION_COOKIE.split("=") : null;

  const routes = DASHBOARD ? DASH : PUBLIC;
  for (const vp of VIEWPORTS) {
    console.log(`\n=== ${vp.name} (${vp.width}px) — cold cache per route ===`);
    for (const route of routes) {
      // Fresh context per route: honest cold-load numbers, comparable runs.
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      if (cookie) {
        await ctx.addCookies([{ name: cookie[0], value: cookie[1], url: BASE, path: "/", sameSite: "Lax" }]);
      }
      const page = await ctx.newPage();
      const client = await ctx.newCDPSession(page);
      const res = await auditRoute(page, client, `${BASE}${route}`);
      await ctx.close();

      const kb = res.total / 1024;
      const parts = Object.entries(res.byType)
        .filter(([, v]) => v > 0)
        .map(([t, v]) => `${t.trim()} ${fmt(v / 1024)}`)
        .join(" · ");
      console.log(
        `${route.padEnd(28)} ${fmt(kb).padStart(8)}  ${String(res.requests).padStart(2)} req  ` +
          `DCL ${String(res.dcl).padStart(4)}ms  load ${String(res.load).padStart(5)}ms`
      );
      if (parts) console.log(`    ${parts}`);
      for (const h of res.heavy) {
        console.log(`    heavy: ${fmt(h.size / 1024).padStart(7)}  ${h.type.trim()}  ${h.url.slice(0, 110)}`);
      }
    }
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});