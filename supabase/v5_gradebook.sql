-- =============================================================
-- UniMate — V5: Gradebook
-- Run in the Supabase SQL Editor (Dashboard > SQL > New query).
-- Idempotent — safe to run as-is.
-- =============================================================

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  letter text not null
    check (letter in ('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F')),
  credits numeric not null default 3 check (credits > 0 and credits <= 20),
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.grades enable row level security;

-- Idempotent policy: drop + recreate keeps this file safe to run twice.
drop policy if exists "Users manage own grades" on public.grades;
create policy "Users manage own grades"
  on public.grades for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================
-- END OF V5 MIGRATION
-- =============================================================