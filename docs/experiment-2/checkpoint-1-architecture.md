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