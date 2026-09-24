-- =============================================================
-- UniMate — V3: Goals
-- Run in the Supabase SQL Editor (Dashboard > SQL > New query).
-- Idempotent — safe to run as-is.
-- =============================================================

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  measure text not null
    check (measure in ('tasks-completed', 'focus-minutes', 'courses', 'streak')),
  target integer not null check (target > 0),
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;

-- Idempotent policy: drop + recreate keeps this file safe to run twice.
drop policy if exists "Users manage own goals" on public.goals;
create policy "Users manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================
-- END OF V3 MIGRATION
-- =============================================================