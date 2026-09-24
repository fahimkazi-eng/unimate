# UniMate — Experiment #2, Checkpoint 1: Architecture Map

> **Golden rule:** this is an *upgrade* of the existing product, not a rebuild.
> This map exists so every later checkpoint can reuse, extend, or replace
> specific pieces without touching what works.
>
> Status: V1 shipped (auth → dashboard → tasks → courses → focus → progress),
> live at unimate-fawn.vercel.app. Branch `main`, clean tree.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.3.6** (App Router, Turbopack) | `middleware.ts` is now **`proxy.ts`** (confirmed live in `src/proxy.ts`) |
| UI | React 19.2.8, TypeScript 5, Tailwind v4 (`@tailwindcss/postcss`) | CSS-first theming via `@theme` |
| Backend | **Supabase** — Auth + Postgres | `@supabase/ssr` for cookie sessions |
| Validation | zod ^4.6.5 | `z.uuid()`, `z.coerce.number()`, `flatten().fieldErrors` |
| Icons | lucide-react | |
| Fonts | Geist / Geist Mono via `next/font` | To be upgraded in Checkpoint 2 |

## 2. Routing (App Router)

```
/                       Landing (public)
/login, /signup         Auth pages (signed-in users redirected away)
/check-email            Post-signup confirmation prompt
/auth/callback/route.ts Code exchange (works for email confirm AND Google OAuth)
/dashboard              Overview — greeting + stats + deadlines + focus card
/dashboard/tasks        Task CRUD (server-action forms)
/dashboard/courses      Courses + /dashboard/courses/[id]/edit
/dashboard/focus        Pomodoro timer + recent sessions
/dashboard/progress     XP/level/streak, weekly chart, course progress
src/proxy.ts            Session refresh + route protection (all /dashboard guarded)
```

All dashboard pages are `force-dynamic` and guard with `requireUser()`.

## 3. Auth system (current)

- **Email + password only.** Signup stores `full_name` in `user_metadata`;
  the `handle_new_user` trigger copies it into `profiles.display_name`.
- Email confirmation enabled → `/auth/callback` exchanges the code (already
  OAuth-ready by design).
- **Session:** `createServerClient` in `src/lib/supabase/server.ts` (cookies),
  refreshed by `proxy.ts`; browser client in `client.ts`.
- **Guards:** `requireUser()` (server) + proxy redirect. `logout()` currently
  redirects to `/login` — Experiment #2 wants signed-out users back on the
  **public homepage demo** instead.
- Profile row is created lazily by `getOrCreateProfile` (race-safe: re-read on
  duplicate-key) with a documented INSERT policy fallback.
- **No Google OAuth yet** (Checkpoint 9) — the callback route already handles
  `code` + `next`, so wiring `signInWithOAuth` is mostly config + redirect URL.

## 4. Data model (`supabase/v1_schema.sql` + `src/lib/database.types.ts`)

| Table | Columns (relevant) | Notes |
|---|---|---|
| `profiles` | id, display_name, xp, level, streak, last_activity | No avatar / Google name yet → migration needed (C9) |
| `courses` | id, user_id, name, code, color | ON DELETE SET NULL from tasks |
| `tasks` | id, user_id, course_id, title, description, due_date, priority, status, estimated_minutes, updated_at | `set_updated_at` trigger; enums `task_status`, `task_priority` |
| `study_sessions` | id, user_id, course_id, duration, started_at, completed_at | Focus minutes = XP |

- **RLS on all four tables**, every policy scoped to `auth.uid()`; queries also
  filter `user_id` (defense in depth). No service key anywhere — anon key only.

## 5. Data access layer

- `src/lib/queries.ts` — `getOrCreateProfile`, `getIncompleteDeadlines`,
  `getTasks`, `getTask`, `getCourses`, `getCourse`, `getTaskStats`,
  `getStudyStats`, `getRecentSessions`, `getWeeklyStudyByDay`,
  `getCourseProgress`. All user-scoped, all return empty/[] on error.
- `src/lib/gamification.ts` — level math (`⌊√(xp/100)⌋ + 1`, shared everywhere)
  + `recordProgress(userId, xp)` = award XP + streak update in one entry point.
- Server actions: `auth.ts` (signup/login/logout), `tasks.ts` (+10 XP on
  complete), `courses.ts`, `sessions.ts` (+1 XP/min). All zod-validated,
  return `{errors, message, success}`, `revalidatePath` the affected pages.

## 6. Design tokens (`src/app/globals.css`)

Light theme only today: `background #fafafa`, `surface #fff`, `foreground`,
`primary #4f46e5` (indigo), `accent #7c3aed`, status colors, radii, card
shadows — all semantic, nothing hard-coded in components (good baseline).
**Missing for Checkpoint 2:** dark theme, glass surfaces, glow shadows,
secondary surfaces, motion tokens, Plus Jakarta Sans / Inter.

## 7. Public homepage (current)

`navbar.tsx` (sticky, mobile menu) · `hero.tsx` (static mock dashboard card —
**already shows a "Fahim" demo persona**, satisfying spec rule 10) ·
`how-it-works.tsx` (3 steps) · `features.tsx` (6 cards) · `roadmap.tsx`
("Coming soon" tags — honest) · `faq.tsx` · `cta.tsx` · `footer.tsx`.

**Missing (Checkpoints 6–8):** ambient animated background, live looping
product preview, feature demo system (course/task/focus/progress/gamification),
semester timeline, scroll-reveal animations, creator video section.

## 8. App shell (after auth)

- `AppNav` (`src/components/dashboard/app-nav.tsx`): brand mark + 5-tab
  scrollable row. **No left sidebar yet** — Checkpoint 3 replaces this with a
  premium desktop sidebar (logo, grouped links, animated active pill,
  collapsible + tooltips, bottom account area with photo/nickname/level/logout).
- `LogoutButton` exists and can be reused inside the account menu.

## 9. Feature pages & components

| Page | Builds on | Notes |
|---|---|---|
| Dashboard | `stat-card`, `deadline-list` | No "Your next move", no command palette, no heatmap (C4/C11) |
| Tasks | `task-form`, `task-row` | Established `useActionState` form pattern to copy |
| Courses | `course-form` | CRUD + edit route |
| Focus | `focus-timer` (circular ring, pause/resume/finish), `recent-sessions` | |
| Progress | `weekly-chart` (CSS bars), `course-progress` | |

UI kit: `ui/{button,card,badge,input,select,textarea}`, `auth/label`,
`lib/utils.ts` (`cn`). Empty/loading/error states exist per page (basic).

## 10. Responsive / mobile (current)

Desktop-first grids that stack; nav has a mobile menu; AppNav tabs scroll
horizontally; stat cards wrap. No bottom navigation, no dedicated mobile
shell (Checkpoint 12).

## 11. Performance / security baseline (already decent)

- No animation libraries — CSS only (cheap to extend responsibly).
- RLS + user-scoped queries + zod everywhere + `server-only` guards.
- `prefers-reduced-motion` not yet respected (add in C5/C8/C13).

---

## Reuse map — how each checkpoint lands on existing code

| # | Checkpoint | Reuses | New work |
|---|---|---|---|
| 2 | Design system / themes | `globals.css @theme`, all semantic classes | dark theme, glass/glow tokens, font swap, motion tokens |
| 3 | App shell/sidebar | `app-nav` items, `logout-button`, `ui/*` | `components/dashboard/sidebar.tsx`, active-pill animation, account menu |
| 4 | Dashboard upgrade | all `queries.ts`, `stat-card`, `badge` | "Your next move" widget (deterministic), widget-row architecture |
| 5 | Motion system | nothing new | `motion.ts` utilities, `Reveal` component (IntersectionObserver), reduced-motion |
| 6 | Homepage upgrade | `navbar`, `footer`, copy/sections | ambient bg, live preview, new hero |
| 7 | Feature demos | `ui/*` styles, progress/chart math | `components/demos/*` (course/task/focus/progress/gamification) |
| 8 | Creator video | — | lazy `<video>` panel, poster, loop, reduced-motion |
| 9 | Auth/profile | callback route, `getOrCreateProfile`, trigger | Google OAuth, `avatar_url`/google-name columns, v2 migration, logout→`/` |
| 10 | Gamification/achievements | `gamification.ts` math, XP wiring | `achievements` table + unlock logic + badges |
| 11 | Calendar/goals/palette | forms/queries patterns | new tables + pages, Cmd+K palette, keyboard nav |
| 12 | Mobile polish | nav/AppNav | bottom nav, touch targets, horizontal stat scroll |
| 13 | Audit | everything | a11y, lazy-loading, offscreen pause, security re-check |
| 14 | Polish + deploy | env pattern | Google OAuth env on Vercel, redirect allowlist, redeploy |

## Spec items already satisfied (do not redo)

- Rule 10 — public homepage uses "Fahim" as demo persona (hero mock). ✅
- Rule 51/52/53 — demo/real separation by construction; server-determined
  identity; user-scoped queries + RLS. ✅
- Honest "Coming soon" roadmap copy. ✅
- Meaningful commits, typed + componentized code, env via `.env`. ✅

## Checkpoint 25 — V2 Phase 11 applied (final audit + security)

The last V2 phase: make the whole repo lint-clean under the modern
`react-hooks` rules, close the remaining a11y gap, and re-verify security.

- **Lint — `eslint.config.mjs`:** added `@typescript-eslint/no-unused-vars`
  with `argsIgnorePattern/varsIgnorePattern/caughtErrorsIgnorePattern: "^_"`
  (server-action signatures require `(_prevState, _formData)` — underscore is
  the conventional "intentionally unused" marker, not cruft) and turned off
  `no-require-imports` for `scripts/**/*.cjs` (plain Node scripts legitimately
  use `require`). Net effect: 11 errors + 12 warnings → 0 / 0.
- **`command-palette.tsx`:** dropped both `set-state-in-effect` effects. The
  open-reset is now done **during render** via React's documented
  "adjust state when a value changes" pattern (`prevOpen` comparison), and
  the index clamp is a render-derived `activeIndex =
  Math.min(index, Math.max(0, items.length - 1))` used everywhere the list is
  read (Enter, `aria-activedescendant`, listbox selection). Keyboard handlers
  keep their own clamps.
- **`sidebar.tsx` / `ui/reveal.tsx`:** post-mount reads (localStorage
  collapse pref; non-IntersectionObserver fallback) deferred one frame via
  `requestAnimationFrame` + `cancelAnimationFrame` cleanup — same display
  behavior, satisfies `set-state-in-effect`.
- **`focus-timer.tsx`:** `recordingRef.current` was read during render (new
  `refs-during-render` rule) — added a `recording` state mirror for the
  Start-button `disabled` prop; the ref still guards double submission around
  the async server action.
- **`ui/input.tsx`, `ui/textarea.tsx`, `auth/password-input.tsx`:**
  empty `interface X extends React.ComponentProps<...> {}` →
  `type X = React.ComponentProps<...>` (`no-empty-object-type`).
- **Unused imports removed:** `Link` (check-email), `addGrade`
  (academics — the `GradeForm` binds that action), `TaskWithCourse`
  (planner), `LayoutDashboard` (mobile-bottom-nav).
- **Deliberate `<img>` kept** with rationale disables: `brand-mark.tsx`
  (SSR-safe 32px logo with onError fallback — `next/image` would change that
  behavior) and `creator-video.tsx` ×2 (tiny SVG posters).
- **A11y:** added **skip-to-content links** on the landing page and the
  dashboard layout (`href="#main-content"`, `sr-only` until focused; `main`
  elements now carry `id="main-content"` + `scroll-mt-4`). Re-verified: every
  dashboard and auth page has a real `h1`; forms/labels/aria-labels present
  (goal, grade, planner budget, assistant chat); global `focus-visible` ring
  (C13) still covers the V2 interactive elements.
- **Security re-check (all pass):** no secrets in `src` (supported-key grep
  clean), `.env*` gitignored, AI key behind `import "server-only"` in
  `lib/assistant.ts`, RLS scopes every table to `auth.uid()` (v1 tasks/
  courses/sessions/profiles, v3 goals, v5 grades), `proxy.ts` guards
  `/dashboard`, Google OAuth redirect locked to the Supabase allowlist.
- **Verified:** `npm run lint` exits 0 with zero warnings; `npm run build`
  green; dev server restarted.

## Checkpoint 24 — V2 Phase 10 applied (homepage: honest V2 showcase)

The public landing was still describing V1 after P5–P9 shipped — features were
the 6 V1 cards under an "Included in V1" badge, the roadmap listed **AI study
tools** and **Smart planner** as "Coming soon" (both live since P5/P6), the FAQ
answered "AI? Not in V1", and the hero said "Free during V1 · No required AI".
Phase 10 fixed the honesty gap and promoted the V2 features:

- **`features.tsx`:** grid grew 6 → 12 cards (`sm:grid-cols-2 lg:grid-cols-3`,
  4 clean rows), badge → "Included in V2". Six new cards map to real V2 pages:
  Study Coach, Smart planner, Calendar 2.0, Academics, Emergency mode,
  Sign-in & profile. Order leads with the V2 marquee features, then the V1
  core; every description is honest ("advisory by design", "honestly says so
  when it's offline", "honest status where university data isn't wired up").
  Reveal stagger capped at `Math.min(i, 5) * 70` — a 12-card grid must not
  sit invisible up to 770 ms.
- **Six new demos** in `src/components/demos/`, same pattern as the V1 set
  (client, `prefersReducedMotion()` guard, token-based, transform/opacity
  only): `demo-coach` (chat exchange), `demo-planner` (7-day advisory bar
  chart with ≈ min labels), `demo-calendar` (week strip + agenda line),
  `demo-academics` (gradebook rows + GPA chip), `demo-emergency` (crisis
  headline cycling to a calm "All clear" state), `demo-auth` (Google/email
  paths). All use demo data pre-login only (rule 10).
- **`roadmap.tsx`:** rewritten — one honest "Still ahead" card (Career tools)
  + a "Already shipped in V2" checklist (6 items, `CircleCheck`). Heading is
  now "One thing left on the list".
- **`faq.tsx`:** AI answer rewritten — Study Coach is optional, runs off an
  operator-supplied server-side key, and "without one it simply says so and
  stays offline; core tools never depend on it". "Free" answer dropped the
  V1 reference.
- **`hero.tsx` / `signup/page.tsx`:** stale "Free during V1 · No required
  AI" → "Free · Email or Google sign-in · Optional AI coach"; signup blurb
  drops "during V1".
- **`README.md`:** intro lead updated to V2 ("plus an AI Study Coach, smart
  planner, gradebook, and calendar"); V1 feature table retained as shipped
  history, V2 table already present.
- **Lint:** the newer `react-hooks/set-state-in-effect` rule now flags the
  V1 demos' `if (prefersReducedMotion()) { setX(...); return; }` pattern.
  All demo files fixed with a deferred `requestAnimationFrame` terminal state
  (still displays instantly, satisfies the rule) + derived booleans for
  reset effects (`demo-focus`, `demo-gamification`, `demo-progress`,
  `demo-tasks`, `demo-emergency`). `creator-video.tsx` keeps two pre-existing
  `no-img-element` warnings (deliberate lazy `<img>` poster — out of scope).
- **Verified:** `npm run build` green; rendered HTML contains every new
  section/string and none of the stale ones; `/signup` copy updated.

Remaining from the V2 spec: only the user-deferred dashboard screenshot
re-shoot (needs a real test login — see Checkpoint 25). Phase 11 final audit
shipped above; v5 gradebook migration was run by the user and verified applied
via PostgREST probe (table + columns + RLS present, zero rows).

## Checkpoint 23 — V2 Phase 9 applied (motion polish + optimistic tasks)

The task-complete/task-creation rework promised for P9/P10 (spec 15) — the
"instant feel" premium trim. Tasks now respond on click, not on round-trip:

- **`src/components/tasks/optimistic-task-row.tsx`** (new, client):
  - Complete toggle applies INSTANTLY (check fills in), delete applies
    instantly (row exits with the new `row-exit` animation), both reconcile
    with the server in a `useTransition`. A failed action reverts the row
    and shows the **real** error inline (`role="alert"`, auto-hides after
    4 s) — no silent failures. The prior `task-row.tsx` waited silently on a
    full server round-trip for every action.
  - `useOptimistic` was considered and rejected deliberately: in Next 16
    `router.refresh()` is a fire-and-forget `void`, so `useOptimistic`'s
    revert fires *before* the fresh payload lands → a visible flicker. A tiny
    per-row override state persists until the row unmounts (a successful
    complete/delete always moves the row out of its current list, so the
    fresh mount re-reads the server prop; failures clear the override
    explicitly). Flicker-free by construction.
  - Touch targets: the three row icon buttons are ≥44 px on mobile
    (`min-h-11 min-w-11`), compact again on `sm` — a11y without density cost.
  - Reduced-motion safe: `animate-row-in`/`animate-row-exit` are
    transform/opacity only, and the existing reduce block now also zeroes
    `animation-delay` (a staggered row must never sit invisible while its
    keyframe `from` state holds).
- **`src/components/tasks/task-list.tsx`** (new, client): keyed list around
  the rows. Keys are stable task ids, so a server refresh reconciles rows in
  place — only genuinely new rows play their entrance animation (no janky
  full-list re-animation). Handles both the Active and Completed sections.
- **`src/app/actions/tasks.ts`:** `toggleTaskComplete` and `deleteTask` now
  return `TaskActionResult { ok, message? }` instead of silently swallowing
  failures — zod-validated ids, honest error messages, still scoped to the owner, still
  revalidate.
- **`src/app/dashboard/tasks/page.tsx`:** both lists now render through
  `TaskList` with the same Active/Completed split and counts. `task-row.tsx`
  deleted (no other users).
- **Motion tokens** in `globals.css`: `row-in` (200 ms slide-up + fade, both
  fill) and `row-exit` (160 ms slide-right + fade); stagger ≤6 × 35 ms.

## Checkpoint 22 — V2 Phase 8 applied (emergency mode)

Emergency mode at `/dashboard/emergency` — the README/landing "Emergency help"
promise, now real. One calm screen for crunch time, real-data-only and
*advisory by construction* (spec 37: never edits tasks, never moves dates,
never schedules — every escape hatch just links to a user-owned action):

- **`src/lib/emergency.ts`** (new, pure, server-safe): 
  - `detectCrisis` — the single most urgent open task = earliest-due, but
    only when time is actually short (overdue OR due within `CRISIS_WINDOW_DAYS`
    = 7). A deadline 10 days out honestly returns `null` — no fake panic.
    Returns signed days/hours + a human headline ("Overdue by 2 days",
    "Due today · 5:00 PM", "Due in ~47 hours").
  - `crunchLoad` — real load math: minutes (estimates are the user's; missing
    → 25 min, the same stated assumption as the planner) + overdue/due-today/
    within-week counts over open dated tasks.
  - `sprintEstimate` (ceil to 25-min sprints) and `deferrableList` — open,
    low-priority, undated tasks that are safe to postpone (advisory only).
  - `priorityTone` — badge tone mapping.
  - 37-assertion probe green (empty/completed/far-future → null, hours vs
    days headlines incl. singulars, earliest-due always wins, crunch
    exclusions, sprint rounding, deferrable filter/sort).
- **Page** (server, force-dynamic): big crisis card (course color bar, title,
  code, priority badges, large countdown, "Start a focus session" →
  `/dashboard/focus?course=<id>` which the focus page validates against the
  user's real courses, secondary link to the task's edit page); a 4-stat
  load strip (Overdue / Due today / Due this week / Load ahead); "the honest
  math" card comparing the load (~N min) to the user's *logged* weekly focus
  minutes (never promised); and a "What can wait" advisory list. Calm state
  when nothing is urgent ("Nothing's on fire right now" + still shows the
  load). Footer states the advisory design plainly.
- **Nav:** Emergency (Siren) added to the sidebar + Cmd+K palette (keywords:
  panic crisis crunch deadline urgent help rescue) right after Focus, and to
  the mobile More sheet (after Planner).
- **Honest public copy:** the landing roadmap always said "we won't claim
  them before they exist" — Emergency Mode is now removed from that list
  (and its Siren import), and the README's coming-soon drops "Emergency
  help" & "AI study assistant" (shipped as Study Coach) in favor of a real
  "Features (V2)" table.

## Checkpoint 21 — V2 Phase 7 applied (academics)

Academic center at `/dashboard/academics` — real where the schema supports it,
honest where it doesn't (no fabricated grades, attendance or exam data):

- **Gradebook & GPA** — the only part needing a new table. `supabase/v5_gradebook.sql`
  creates `public.grades` (user_id, course_id FK cascade, letter, credits, RLS —
  same idempotent pattern as v3 goals). What the user enters is *their* data;
  the GPA is pure math over it. `src/lib/grades.ts` (pure, server-safe): 4.0
  letter scale, credit-weighted `computeGpa` (Σ points×credits / Σ credits,
  `gpa: null` when empty — honest "no grades yet", never a fake 0.0),
  `perCourseGpa`, `formatGpa`. 21-assertion probe green (scale, weighting,
  missing/zero credits default 3, unknown-letter skip, F counted, per-course map).
- **Two server actions** (`src/app/actions/grades.ts`): `addGrade` uses
  `upsert` on `(user_id, course_id)` so re-saving a course updates instead of
  duplicating; `deleteGrade` is user-scoped. Both zod-validated; `PGRST204`
  (table missing pre-migration) returns a clear "run v5" message instead of a
  crash — same tolerant pattern as goals (C11).
- **`src/lib/gradebook.ts`** (server-only): `getGradebook` joins grades to
  courses, returns `{ grades, error }` so the page shows an honest migration
  banner when the table doesn't exist yet.
- **Page** (server, force-dynamic): cumulative GPA card + add-grade form
  (`src/components/academics/grade-form.tsx`, course/letter/credits selects,
  disabled honestly when the user has no courses) + deletable grade list with
  course color bars; a **course snapshot** section derived from real tasks
  (per-course done/open counts, completion bar, next due via `formatDueLabel`,
  per-course GPA badge); and honest **coming-soon** cards for Attendance and
  Exams explaining *why* (no institutional data source exists — never invented
  percentages or results) with a pointer to using tasks for exam dates.
- **Nav:** Academics (GraduationCap) added to the sidebar after Courses, the
  Cmd+K palette (keywords: gpa grades gradebook attendance exams semester), and
  the mobile More sheet (after Courses).
- Query path verified: unauth GET redirects 307 → `/login?next=%2Fdashboard%2Facademics` (same guard as every dashboard page).

## Checkpoint 20 — V2 Phase 6 applied (smart planner)

Smart Planner — a deterministic week-plan engine over real open tasks,
*advisory by construction* (spec 37: it never writes; every planned row still
opens the task so the user confirms):

- **`src/lib/planner.ts`** (new, pure, server-safe): `planWeek` spreads real
  open tasks across the next 7 days with honest rules — overdue tasks land
  earliest (a task too big for any remaining slot is force-placed on the
  lightest day and that day is marked overloaded, so nothing overdue is ever
  stranded); dated tasks are back-planned to the LATEST day ≤ their due date
  (work lands near the deadline but never after it, and tasks that miss get an
  honest "after due date" flag); undated tasks fill the lightest days, high
  priority first. Completed tasks are ignored; `?budget=` (30–300, default
  120) is clamped via `parseBudgetParam`. 32-assertion probe green
  (param clamping, overdue-first, back-planning, late flags, overload honesty,
  unassigned honesty, deterministic repeatability).
- **`src/app/dashboard/planner/page.tsx`** (new, server, force-dynamic):
  day cards for the 7-day horizon (Today/Tomorrow/date headings), per-day
  minutes + "over budget" honesty, a 3-stat strip (planned / over budget /
  after due date), an honest "couldn't place this week" section (with a
  warning when a task exceeds the whole daily budget), the advisory-footer
  note, and a server-driven `?budget=` segmented control (60/90/120/180 min)
  matching the calendar view-switcher pattern (a11y, no-JS).
- **Nav:** Planner added to the sidebar and the Cmd+K palette right after
  Calendar, and to the mobile More sheet (between Courses and Goals).
- Tasks with no estimate are assumed at 25 min (`DEFAULT_ESTIMATE_MINUTES`) —
  stated honestly in code and copy, never silently.

## Checkpoint 19 — V2 Phase 5 applied (AI study OS)

Study Coach — the AI layer, built *honest by construction*:

- **Spec 46 (AI key never on frontend):** the key is only ever read from
  server env (`ASSISTANT_API_KEY` inside `src/lib/assistant.ts` / the server
  action). No `NEXT_PUBLIC_*` AI var exists; the client sees only the boolean
  "is it configured?" — never the key.
- **`src/app/dashboard/assistant/page.tsx`** (new, server, force-dynamic):
  smart cards computed *from real data* on every load — Next move (reuses the
  existing `NextMoveWidget`), Week load (open tasks due in the next 7 days +
  estimated minutes), Course watch (course with the most open tasks + its next
  due date), Momentum (streak / level / XP / weekly focus minutes). Zero fake
  numbers — all rows are the user's actual tasks/courses/study sessions.
- **`src/components/assistant/study-assistant.tsx`** (new, client): the Study
  Coach chat. Empty state with one-tap suggestion chips; user/assistant
  bubbles; pending "typing" dots; honest error row. It works **even with no AI
  key** — replies are clearly honest about the wiring (no pretend AI).
- **`src/app/actions/assistant.ts`** (new, server action): `coachReply` —
  zod-validated message + bounded history (last 10 turns, each ≤2000 chars),
  real-data context built from the user's actual profile/tasks/courses/focus
  stats, `parseHistory` sanitizes the client-supplied history before it ever
  reaches the model.
- **`src/lib/assistant.ts`** (new, server-only): `buildCoachContext` (pure —
  12-assertion probe green: identity/level/XP/streak, task counts, focus
  stats, deadline, course rows incl. "no next due" and empty-state cases) and
  `askLlm` — OpenAI-compatible chat-completions call with timeout, returns
  `null` (→ honest offline reply) when the key is missing or the call fails.
- **Nav:** Assistant added to the sidebar (Sparkles), the mobile More sheet,
  and the Cmd+K palette (which also finally gains Profile).
- Honest states only: with no key the page says so plainly instead of faking.
  With `ASSISTANT_API_KEY` server env + optional `ASSISTANT_BASE_URL` /
  `ASSISTANT_MODEL`, the same chat turns into a real, data-grounded coach —
  no other code change.

## Checkpoint 18 — V2 Phase 4 applied (calendar 2.0)

Calendar 2.0 upgrades C11's month grid *in place* — no rebuild, everything
still server-driven links (`?view&month&day`) so it stays keyboard/AT
accessible and works without JS:

- **`src/lib/calendar.ts`** (new, pure, server-safe): calendar math extracted
  from the page so views stay thin — param parsing (`view/month/day`, with
  real-date validation that rejects Feb 30), `monthCells` (Monday-first 6×7),
  `weekCells` (7 columns around an anchor day), `bucketByDay` (clock-order
  preserving), headings/relative tags (`daysFromToday`), `formatWeekRange`,
  `addDays`.
- **Three views** via `?view=`:
  - *Month* — the existing grid (refactored onto `calendar.ts`).
  - *Week* — 7 columns for the week containing the selected day; each column
    shows the date (today filled), up to 3 course-colored task chips + "+N
    more"; prev/next week and Today nav.
  - *Agenda* — chronological, grouped-by-day list with relative tags
    (Overdue/Today/Tomorrow) and day headers; reuses the day-detail task row.
- **Segmented view switcher** (Month/Week/Agenda) with `aria-current`; view
  switches keep sensible context (week anchors on the selected day, month
  switches land on that day's month).
- **Explicit add-on-day** (spec 37 — no silent scheduling): the day-detail
  panel gets an "Add task on this day" button → `/dashboard/tasks?due=yyyy-mm-dd`;
  `tasks/page.tsx` validates the param and `task-form.tsx` prefills the due
  date. The user still explicitly reviews and saves — nothing is scheduled
  silently.
- Day detail + empty states shared across grid views.

## Checkpoint 17 — V2 Phase 3 applied (auth UX)

- **`password-input.tsx`** (spec 25): show/hide toggle inside the password
  field (login/signup/reset), `aria-label` Show/Hide, `type="button"`,
  180ms-fast icon crossfade (`animate-fade-in-fast`).
- **`password-strength.tsx`** (spec 26): compact Weak/Fair/Strong 3-segment
  meter while typing (signup + reset); matches the server rule (8+ chars,
  case mix, digit, symbol).
- **Forgot/reset flow** (spec 24): `/forgot-password` (public card) →
  `sendPasswordReset` (anon `resetPasswordForEmail` with `redirectTo` back to
  `/auth/callback?next=/reset-password`) → generic reply so we never leak
  whether an email exists → `/reset-password` (session-guarded; cold visits
  bounce to `/forgot-password`) → `updatePassword` → `/dashboard`.
- **Profile page** `/dashboard/profile` (spec 28): avatar/name/email header,
  live level/XP/streak stats, editable nickname + university/department/
  semester (1–16 select)/academic year. `supabase/v4_profile_fields.sql`
  adds the four academic columns. `updateProfile` probes the extended columns
  and falls back to V1-safe `display_name` until the v2/v4 migrations run —
  saving never breaks pre-migration.
- Nav: Profile moved from "Soon" to live in sidebar, account menu, mobile
  More sheet. Spec 27 (fast login→dashboard) needed no code: the 180ms
  route fade from P1 already delivers the instant feel.

## Checkpoint 16 — V2 Phase 2 applied (brand, complete)

- **Asset** — the real logo (dark glow-tile, 1254×1254) is at
  `public/logo.jpeg` (copied from `C:\Users\Public\Pictures\UniMate logo.jpeg`).
- **`src/components/brand/brand-mark.tsx`** — the single source of truth for
  the UniMate mark, used by navbar, footer, /login, /signup, sidebar and the
  mobile header. Renders the logo directly (`rounded-lg object-cover` dark
  tile = premium on both themes); falls back to the indigo cap placeholder
  only on image error. Deliberately no reveal-on-load: on SSR pages the
  browser can fire `load` before hydration and leave the logo hidden (fixed
  after the verify probe caught it 0×0).
- **Favicon** — `src/app/icon.tsx` serves the real logo tile as a 64×64 PNG
  (embedded from disk as a data URL); verified transparent rounded corners +
  dark tile pixels. Replaces the interim cap glyph.
- **Entrance** — landing navbar + auth brand marks get `animate-scale-in`
  (spec 5: calm, not bouncy). The asset carries its own purple glow.
- Light-theme screenshot check deferred: light mode isn't user-selectable yet
  (appearance toggle lands with the theme system, spec 63); the dark tile
  design is theme-proof by construction.
- **Deferred deliberately**: app-icon/apple-icon follow the theme system
  phase too — the favicon already brands the browser tab everywhere.

## Checkpoint 15 — V2 Phase 1 applied (performance foundation)

V2 master spec phases land on top of Experiment #2 as checkpoints (this doc
stays canonical). Phase 1 = feel, not features:

- **Instant press feedback** (spec 6–8): global `a/button/[role=button]:active`
  → `transform: scale(0.97)` in `globals.css` base layer (transform-only,
  compositor-safe; elements with their own `transition-*` utility keep it,
  everyone else gets a 120ms tween). Nothing elaborate — motion with purpose.
- **Tap delay**: `touch-action: manipulation` on all `a`/`button` kills the
  legacy ~300ms double-tap zoom delay on touch devices.
- **Faster navigation** (spec 6): route-change fade cut 300ms → 180ms via new
  `--animate-fade-in-fast` token (`page-transition.tsx`).
- **Mobile decoration budget** (spec 11): the two peripheral hero orbs are
  `display:none` below 768px (overdraw cost on phone GPUs); center glow +
  vignette stay. Ambient orbs were already filter-free (gradient + transform
  drift), so desktop keeps the full ambience.
- **Deferred deliberately** (documented, not forgotten): skeletons (spec 14)
  land with the first client-data screens (AI tools, P5); optimistic updates
  (spec 15) land with task-complete/task-creation rework (P9/P10). Dashboards
  are server-rendered — no client loading state to skeleton yet.

## Checkpoint 14 — applied (final polish + screenshots)

- **Re-shoot tooling**: `scripts/shoot-screenshots.cjs` + `npm run screenshots`
  — drives the system Chrome via `playwright-core` (dev dep, no browser
  download) with `prefers-reduced-motion` emulated so captures are stable.
  Public shots worked immediately (no session needed).
- **README**: dark homepage hero + login/signup/check-email shots replace the
  stale V1 light-theme dashboard screenshots (deleted — they no longer
  reflect the shipped product). Dashboard shots pending a logged-in session:
  `UNIMATE_SESSION` + `npm run screenshots -- --dashboard`.
- **Verified dark**: pixel-sampled the new PNGs (avg luminance 14–27 vs
  248–251 for the old light set).
- **Status**: project redeploys on `main` push (Vercel). Pending user-owned
  steps: Supabase v2/v3/v4/v5 migrations + Google provider config (C9/C11/P7),
  and optionally re-shooting dashboard shots with real data.
- Probe note: two unconfirmed throwaway auth users were created during C14
  (`unimate.shot+…`, `rawprobe+…` @gmail) — safe to purge in Supabase →
  Auth → Users.

## Checkpoint 13 — applied (audit)

- **A11y — keyboard focus**: global `a/button/[role=button]:focus-visible`
  outline (ring token) in `globals.css` base layer, so every plain link and
  raw button shows focus; ring-based controls keep theirs (their
  `outline-none` utility wins). Command-palette input now has a visible ring.
- **A11y — headings**: `/login`, `/signup`, `/check-email` now start with a
  real `h1` (previously only an `h3` CardTitle, no page-level heading). All
  dashboard pages already had `h1`; landing keeps `h1 → h2 → h3` order.
- **A11y — reduced motion**: global media collapse + force-reveal already
  covered C5; verified drift/float/animate-* all collapse, video only ever
  starts from an explicit gesture.
- **Offscreen pause**: creator video now pauses via IntersectionObserver
  when scrolled out of view and resumes if it was playing (muted, GPU-wise
  free — no hidden playback).
- **Lazy-loading**: video stays lazy (mounts only on play); poster+assets are
  tiny SVGs; no heavy images anywhere.
- **Security re-check**: no secrets in code (anon key only via env; env
  files git-ignored; no service-role references), RLS scopes every table to
  `auth.uid()`, queries double-filter `user_id`, proxy guards `/dashboard`.

## Checkpoint 12 — applied (mobile polish)

- `src/components/dashboard/mobile-bottom-nav.tsx`: fixed bottom nav on <lg —
  5 primary destinations (Overview, Tasks, Calendar, Focus, Progress) with
  top indicator pill + a "More" sheet for Courses/Goals/Achievements and
  Log out (mobile finally has logout everywhere, not just the dashboard).
  Safe-area padding, ≥44px targets, backdrop-blur surface.
- `app-nav.tsx` → slim brand-only header (the scrolling tab strip is gone —
  bottom nav owns mobile navigation, no dueling navs).
- Dashboard stat cards: swipeable snap-scroll rail on mobile
  (min-w cards + `snap-x`), full grid from `sm` up.
- `<main>` gains `pb-28 lg:pb-10` so content clears the fixed bar.

## Checkpoint 11 — applied (calendar / goals / command palette)

- **Calendar** (`/dashboard/calendar`): Monday-first month grid derived from
  real task due dates (`getDatedTasks`), prev/next/today month nav, today
  highlight, course-colored dots per day, day-detail panel listing that
  day's tasks (priority badges, links to edit). Server-driven `?month&day`
  params → real links = keyboard/AT accessible.
- **Goals** (`/dashboard/goals`): `supabase/v3_goals.sql` adds the `goals`
  table (title, measure ∈ tasks-completed/focus-minutes/courses/streak,
  target) + RLS, idempotent. `src/lib/goals.ts` computes live progress from
  real all-time stats (no fake data; same derived approach as C10).
  `goal-form.tsx` mirrors the course form pattern (`useActionState`).
  Honest pre-migration state if the table is missing.
- **Command palette** (`⌘K`): `command-palette.tsx` — fade/scale overlay,
  full keyboard nav (↑↓ Enter Esc), combobox a11y wiring, click-outside
  close; opens via ⌘K/Ctrl+K or the sidebar's "Jump to…" trigger
  (CustomEvent). Mounted once in the dashboard layout.
- Sidebar/AppNav: Calendar + Goals promoted from "Soon" to live routes;
  "Eventually" now Notes/Profile/Settings.

## Checkpoint 10 — applied (achievements + gamification)

- `src/lib/achievements.ts`: 11 badge definitions derived from *real* user
  data — no `achievements` table (deliberate: unlocks are computed fresh each
  load from tasks/courses/study_sessions/profile, so they can never go
  stale). Measures: tasks completed, courses, focus sessions, 30-min session,
  streak, XP, level. `getAchievements(userId)` returns per-badge state +
  the closest locked badge ("next up").
- `src/app/dashboard/achievements/page.tsx`: unlock-progress SVG ring,
  Level & XP card (reuses `gamification.ts` math: `levelFromXp`, `xpIntoLevel`,
  `xpForNextLevel`), streak badge, "Next up" spotlight card, and a staggered
  badge grid — locked badges show honest progress bars, unlocked ones glow
  with gradient medals (data-accented, no hard-coded hex).
- Sidebar (desktop) + AppNav (mobile) now list Achievements as a live route
  with the animated active pill.

## Checkpoint 9 — applied (Google auth + profile columns)

- `supabase/v2_google_auth.sql`: idempotent migration — adds
  `google_display_name`, `nickname`, `photo_url` to `profiles`, rewrites the
  `handle_new_user` trigger to capture Google metadata (`full_name`/`name` →
  display name, `avatar_url`/`picture` → photo, email local-part → nickname
  fallback), and backfills existing accounts. **Run it in the Supabase SQL
  Editor** — code is backward-compatible (`select("*")` → missing columns
  read as `undefined`) but the fields only appear after the migration.
- `src/app/actions/auth.ts` → `googleSignIn`: SSR provider flow, redirects to
  `data.url`, honest error if the provider isn't configured yet.
- `src/components/auth/google-button.tsx`: "Continue with Google" (multicolor
  G) — own server action + own form, rendered as a *sibling* of the email
  form (never nested), pending state + error surface.
- `login-form.tsx` / `signup-form.tsx`: restructured to `GoogleButton` +
  divider ("or continue with email" / "or sign up with email") + email form.
- Name everywhere prefers `nickname` → `display_name` → `full_name`;
  `Sidebar` now receives `photoUrl` (AccountMenu already rendered photos).
- Logout already returns to `/` (C3, rule 14). Next: C10 achievements.

## Checkpoint 8 — applied (creator video + semester timeline)

- `public/videos/poster.svg`: branded 16:9 poster (glow orbs, mortarboard,
  "UNIMATE // PRODUCT TOUR"); doubles as the video poster and the coming-soon
  backdrop.
- `src/components/landing/creator-video.tsx`: lazy player — the clip is *not*
  loaded until the user presses play (zero upfront bandwidth), then loops
  muted with glass mute/replay controls; reduced motion only ever plays after
  an explicit gesture. If the MP4 is missing it renders an honest
  "Creator video coming soon" panel.
- `src/components/landing/creator-section.tsx`: server component checks
  `public/videos/creator-loop.mp4` via `fs.existsSync` at render/build time
  and passes `available` down. Drop a real `creator-loop.mp4` into
  `public/videos/` and the section goes live with no other change.
- `src/components/landing/semester-timeline.tsx`: "Your semester, at a glance"
  — Week 1 → Finals timeline with glow milestone dots, staggered Reveal.
- Wired between Features and Roadmap (`/`). Completes the C6–C8 missing list
  (ambient bg · live preview · demos · timeline · scroll reveals · video).

## Checkpoint 7 — applied (feature demo system)

- `src/components/demos/demo-frame.tsx`: shared fixed-height "Live demo"
  panel keeping the features grid even.
- Six looping demo components (`demo-dashboard`, `demo-tasks`, `demo-courses`,
  `demo-focus`, `demo-progress`, `demo-gamification`), all:
  - `"use client"` with timers that **skip entirely** when
    `prefersReducedMotion()` is true (static, fully-revealed end state);
  - token-based colors, transform/opacity or tiny width transitions only.
  - Feature demos: next-move ticker · auto-completing tasks (+XP chip) ·
    course color cycling · pomodoro ring fill · weekly bars growing ·
    XP bar → level-up pulse.
- `features.tsx`: each card now leads with its animated demo in `DemoFrame`,
  then icon + title + copy; card reveal cascade kept from C6.
- `motion.ts`: added client-only `prefersReducedMotion()` helper.

## Checkpoint 6 — applied (homepage upgrade)

- `AmbientBackground` (`src/components/landing/ambient-background.tsx`): theme-aware
  indigo/purple glow orbs + top vignette — token colors via `color-mix`
  (zero hard-coded hex), slow transform-only drift (`animate-drift-1/2/3`,
  22–30s), reduced-motion collapsed globally.
- Hero rebuilt (`hero.tsx`): staged entrance (staggerDelay), app-accurate
  preview — **"Your next move"** widget (course chip, due/priority/estimate
  badges, Start focus), Level 7 · 1,240 XP badge, streak badge, floating
  "+12 XP · Task completed" chip (`animate-float`); Fahim demo persona kept
  (rule 10). Ambient bg, glass + glow accents.
- Navbar (`navbar.tsx`): scroll-elevation effect (border + stronger blur +
  subtle shadow after 8px scroll; settles at top).
- Scroll reveals: features cards cascade (70ms steps) via `Reveal`;
  How it works / Roadmap / FAQ / CTA sections reveal on scroll.

## Checkpoint 5 — applied (motion system)

- `globals.css`: entrance tokens — `--animate-fade-in` (300ms), `--animate-rise-in`
  (500ms), `--animate-scale-in` (350ms) with hoisted `@keyframes`; all
  transform/opacity only (compositor-friendly). Global
  **`@media (prefers-reduced-motion: reduce)`** collapse (durations ≈ 0,
  `scroll-behavior: auto`, force-reveal) and `.reveal` / `.reveal.is-visible`
  transition rules.
- `src/lib/motion.ts`: `staggerDelay(index, stepMs)` for CSP-safe staggered
  entrances.
- `src/components/ui/reveal.tsx`: `Reveal` (IntersectionObserver) — toggles
  `.is-visible` on scroll into view; reduced-motion handled purely in CSS.
- `src/components/dashboard/page-transition.tsx`: keyed fade on route change,
  wired around `<main>` in the dashboard layout (sidebar never remounts).
- Dashboard page choreography: stats stagger-rise (60ms steps), Next move +
  Today's focus follow, Weekly activity + Upcoming deadlines reveal on scroll.

## Checkpoint 4 — applied (dashboard upgrade)

- `src/lib/next-move.ts`: deterministic **"Your next move"** picker (spec §26) —
  open tasks with due dates sorted soonest-first (overdue surfaces), then
  priority, then estimated effort; falls back to the most important undated
  task, then `null`. No fake AI.
- `src/components/dashboard/next-move.tsx`: featured widget — course accent
  rail (course color), eyebrow label, task title, due/priority/estimate
  badges, **Start focus** button that deep-links to
  `/dashboard/focus?course=<id>` (validated server-side) so the focus timer
  preselects the course; honest empty state ("You're all caught up" + Add a
  task → `/dashboard/tasks`).
- `src/app/dashboard/page.tsx` rebuilt: time-of-day greeting
  ("Good morning/evening…"), five KPI cards (Next deadline, Due today,
  Courses, Progress, Studied this week), and a widget grid — Next move +
  Today's focus, then Weekly activity (`WeeklyChart`) + Upcoming deadlines.
- `src/components/focus/focus-timer.tsx` + `src/app/dashboard/focus/page.tsx`:
  `initialCourseId` prop; page validates the `?course=` id against the user's
  courses before passing it on (no accepting arbitrary ids).

## Checkpoint 3 — applied (premium app shell)

- New `src/app/dashboard/layout.tsx`: server layout renders the shell for all
  dashboard routes — **`Sidebar` on desktop** (`lg:`), the existing `AppNav`
  (brand + tabs) as the mobile shell until C12. Pages render their own inner
  content with their own `max-w-*` (widths preserved); the layout supplies the
  `main` padding.
- `src/components/dashboard/sidebar.tsx`: collapsible sidebar (`w-64` ↔
  `w-[72px]`, persisted in localStorage), **animated active pill** that slides
  between items (`translateY`, 300ms `ease-out-quart`, GPU-friendly), hover
  icon scale, custom tooltips when collapsed, and honestly-marked **"Soon"**
  entries for Calendar / Goals / Notes / Profile / Settings (no dead links).
- `src/components/dashboard/account-menu.tsx`: bottom account area — initials
  avatar (gradient brand), nickname, Level · XP; opens a menu (Profile /
  Settings / Appearance marked Soon, working **Log out**). Click-outside +
  Escape close.
- **Logout now redirects to `/`** (public homepage demo) per spec rule 14,
  instead of `/login`.
- All 7 dashboard pages dropped their own `<main>` + `<AppNav />` wrappers.

## Checkpoint 2 — applied (design system)

- **Fonts:** Plus Jakarta Sans (via `next/font/google`, `--font-plus-jakarta-sans`)
  as the UI font; Geist Mono retained for code. Constants live in `layout.tsx`.
- **Tokens:** `src/app/globals.css` now carries the full semantic set —
  `background-secondary`, `surface-elevated`, `surface-glass`,
  `foreground-secondary`, `border-hover`, `primary-light/dark`, `accent-soft`,
  `shadow-lg`, `shadow-glow-primary/accent`, `ease-out-quart/expo`.
- **Themes:** light (default) + dark via `<html data-theme="dark">`. Dark
  values re-declare the same CSS vars (higher specificity than `:root`), so
  every token-using component swaps automatically. `color-scheme` follows the
  theme. Default is **dark**; the appearance setting (Dark/Light/System) will
  land with the Settings page (C9/C11) and should just toggle this attribute.
- **Base polish:** focus-ring offset now uses `--color-background` (no more
  white gap on dark), themed `::selection`.
- Verified compiled: `#0a0a12` bg, glow shadows, Plus Jakarta all present in
  the built CSS chunk.

## Watch-outs

- **Next.js 16.** Do not create `middleware.ts` (it is `proxy.ts` here) and
  check `node_modules/next/dist/docs/` before new framework APIs.
- `.env.local` is gitignored; Google OAuth needs new vars + Supabase provider
  config + Vercel env (C9/C14).
- OneDrive path + Windows: kill the dev server before `npm run build` (shared
  `.next`), per established workflow.