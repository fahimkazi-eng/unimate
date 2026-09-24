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