# UniMate

> Your student operating system — plan your semester, manage deadlines, study
> smarter, all in one place.

UniMate is a student productivity app in active development (V3). Tasks,
deadlines, courses, a pomodoro focus timer, quiet gamification (XP, levels,
streaks) — plus an AI Study Coach, smart planner, gradebook, calendar, and a
command-center Overview — built to be fast, calm, and useful on day one.

## ✨ Features (V1)

| Area | What you get |
| --- | --- |
| **Auth** | Email/password signup & login via Supabase, protected routes, lazy profile creation |
| **Dashboard** | Personalized greeting, streak/level/XP badges, next deadline, due-today count, progress % and weekly study time |
| **Tasks** | Title, course, due date, priority, estimated minutes, description — add, edit, complete, delete |
| **Courses** | Color-coded courses that group your tasks and power the task dropdown |
| **Focus timer** | 15/25/45 min sessions with a progress ring; finished sessions auto-save with XP |
| **Progress** | Level curve, XP bar, day streak, weekly study bar chart, per-course completion |
| **Responsive** | Works from a 320 px phone up to desktop; landing nav scrolls, grids stack, timer scales |

### Coming soon (not built yet — the landing page says so)
- Career tools (CV analysis, skill gaps)

### ✨ Features (V2)

| Area | What you get |
| --- | --- |
| **Study Coach** | Real-data AI assistant (optional server-side key) — plans, context, momentum |
| **Smart Planner** | Deterministic 7-day plan from your real open tasks; advisory only, never writes |
| **Academics** | Gradebook + credit-weighted GPA (your entries), per-course snapshot, honest attendance/exams status |
| **Emergency mode** | One calm screen for crunch time — real crisis, honest load math, advisory "what can wait" |
| **Calendar 2.0** | Month / week / agenda views, server-driven links, add-on-day |
| **Auth UX** | Password strength, forgot/reset flow, Google sign-in, richer profile |

### ✨ Features (V3 — command-center build)

| Area | What you get |
| --- | --- |
| **Overview 3.0** | Bento command center: adaptive hero, Next Move (your single best action), quick-action bar, Today timeline, urgency-ranked deadlines, live course progress, real GPA pulse, calendar + planner previews, weekly progress, goals, achievements, and honest emergency mode |
| **Mobile order** | Overview re-stacks in a spec reading order on phones (greeting → next move → quick actions → …) while the desktop keeps the bento grid |
| **Honest intelligence** | No fake data: attendance/exams show "not tracked yet" until wired, GPA is computed from your gradebook, the AI coach says plainly when it's offline |
| **Homepage AI demo** | A scripted, interactive Study Coach sample (mock persona, pre-login) so visitors feel the product before signing up |
| **Sign-out safety** | Logout moved off the Overview into Profile behind a confirmation dialog — no accidental sign-outs |
| **Motion & theme** | Dark theme default, transform/opacity-only animation, `prefers-reduced-motion` honored site-wide |

## 🧰 Tech stack

- **Framework:** Next.js 16 (App Router, server actions, `proxy.ts` middleware)
- **UI:** React 19, TypeScript, Tailwind CSS v4, lucide-react
- **Data:** Supabase (Postgres + Auth), zod validation
- **Design:** Custom design tokens, hand-rolled UI primitives (no component library)

## 🚀 Getting started

### 1. Prerequisites

- Node.js 20+
- A Supabase project (free tier is fine)

### 2. Install & configure

```bash
git clone https://github.com/fahimkazi-eng/unimate.git
cd unimate
npm install
```

Copy the environment template and fill in your Supabase values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page (publishable key) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally; your Vercel URL in prod |

### 3. Database

Open `supabase/v1_schema.sql` in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new)
and run it. It creates:

- `profiles`, `courses`, `tasks`, `study_sessions` tables
- Row-level security (per-user, `auth.uid()`)
- The `handle_new_user` trigger (auto-creates a profile on signup)

### 4. Run it

```bash
npm run dev
```

Open http://localhost:3000, sign up, and you're in.

## 📁 Project structure

```
src/
├── app/
│   ├── actions/          # Server actions (auth, tasks, courses, sessions, assistant)
│   ├── auth/callback/    # OAuth-ish email confirmation callback
│   ├── dashboard/        # Overview 3.0 + 13 feature pages
│   ├── login/ signup/    # Auth pages
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Button, Card, Input, Select, Badge, Textarea
│   ├── dashboard/        # Hero, Next Move, Today, Deadlines, Academic Pulse,
│   │                     #   AI panel, Progress, Goals, Achievements, Emergency…
│   ├── demos/            # Landing "live demo" panels (one per feature)
│   ├── tasks/ courses/ focus/ progress/   # Feature components
│   └── landing/          # Hero, How It Works, AI Demo, Features, Roadmap, FAQ…
├── lib/
│   ├── queries.ts        # Typed data access (all queries here, profile cached)
│   ├── gamification.ts   # XP / level / streak math + writes
│   ├── goals.ts          # Goal progress + live state
│   ├── achievements.ts   # Achievement unlock state
│   ├── emergency.ts      # detectCrisis + honest load math
│   ├── gradebook.ts / grades.ts   # GPA computation
│   ├── planner.ts        # planWeek preview (advisory)
│   ├── auth.ts           # requireUser, getUser (cached)
│   ├── dates.ts          # Date helpers
│   ├── database.types.ts # Row types + join shapes
│   └── supabase/         # Server, client, middleware clients
├── proxy.ts              # Session refresh + route protection
└── app/globals.css       # Design tokens (@theme) + reduced-motion guard
```

## 🗄️ Data model

| Table | Purpose |
| --- | --- |
| `profiles` | XP, level, streak, display name |
| `courses` | Name, code, color — owned by a user |
| `tasks` | Course (nullable), due date, priority, estimated minutes, status |
| `study_sessions` | Started/completed timestamps, duration, optional course |

Every table is scoped by `user_id` with matching RLS policies (defense in
depth — queries filter by user *and* RLS enforces it).

## 🎮 Gamification rules

- **XP:** +10 for completing a task · +1 per focus minute
- **Levels:** `level = ⌊√(xp/100)⌋ + 1` — level 1 at 0 XP, 2 at 100, 3 at 400…
- **Streak:** consecutive active days grow it; a gap resets to 1; same-day
  activity is idempotent

## 📜 Scripts

```bash
npm run dev      # Start the dev server (Turbopack)
npm run build    # Production build
npm run start    # Serve the production build
npm run lint     # ESLint
```

## ☁️ Deployment (Vercel)

1. Push this repo to GitHub (public or private).
2. Import it in Vercel — framework preset **Next.js** is auto-detected.
3. Add the three `NEXT_PUBLIC_*` env vars (pointing at your Supabase project).
4. In Supabase → Authentication → URL Configuration, add your Vercel URL to
   redirect allowlist, and set `NEXT_PUBLIC_SITE_URL` to the Vercel URL.
5. Deploy. ✅

## 🖼️ Screenshots

| Homepage hero | Study Coach demo |
| --- | --- |
| ![Homepage hero](public/screenshots/home-hero.png) | ![Study Coach demo](public/screenshots/coach-demo.png) |

| Log in | Create account | After signup |
| --- | --- | --- |
| ![Log in](public/screenshots/login.png) | ![Create account](public/screenshots/signup.png) | ![Check your email](public/screenshots/check-email.png) |

The dashboard shots need a logged-in session. Run:

```bash
npm run screenshots -- --dashboard
```

with `UNIMATE_SESSION` set (see `scripts/shoot-screenshots.cjs` for how to
copy the cookie from DevTools). It captures every live route:

| Overview | Tasks | Courses | Calendar |
| --- | --- | --- | --- |
| ![Overview](public/screenshots/dashboard.png) | ![Tasks](public/screenshots/tasks.png) | ![Courses](public/screenshots/courses.png) | ![Calendar](public/screenshots/calendar.png) |

| Academics | Planner | Focus | Progress |
| --- | --- | --- | --- |
| ![Academics](public/screenshots/academics.png) | ![Planner](public/screenshots/planner.png) | ![Focus](public/screenshots/focus.png) | ![Progress](public/screenshots/progress.png) |

| Goals | Achievements | Emergency | Assistant |
| --- | --- | --- | --- |
| ![Goals](public/screenshots/goals.png) | ![Achievements](public/screenshots/achievements.png) | ![Emergency](public/screenshots/emergency.png) | ![Assistant](public/screenshots/assistant.png) |

| Profile |
| --- |
| ![Profile](public/screenshots/profile.png) |

## 📄 License

Private — all rights reserved.