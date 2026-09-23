-- =============================================================
-- UniMate — V1 database schema
-- Run in the Supabase SQL Editor (Dashboard > SQL > New query).
-- Safe to run as-is; designed for V1 only (no AI/career tables yet).
-- =============================================================

-- -------------------------------------------------------------
-- COURSES
-- -------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  code text,                                   -- e.g. "CSE-204"
  color text not null default '#4f46e5',       -- course accent color
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- TASKS
-- -------------------------------------------------------------
create type public.task_status as enum ('todo', 'in_progress', 'completed');

create type public.task_priority as enum ('low', 'medium', 'high');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  title text not null,
  description text,
  due_date timestamptz,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'todo',
  estimated_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh automatically.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- STUDY SESSIONS
-- -------------------------------------------------------------
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  duration integer not null,                   -- minutes
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

-- -------------------------------------------------------------
-- PROFILES (XP / streak / level)
-- -------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  xp integer not null default 0,
  level integer not null default 1,
  streak integer not null default 0,
  last_activity date,
  created_at timestamptz not null default now()
);

-- Automatically create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Users can only ever touch their own rows.
-- -------------------------------------------------------------
alter table public.courses enable row level security;
alter table public.tasks enable row level security;
alter table public.study_sessions enable row level security;
alter table public.profiles enable row level security;

-- Courses
create policy "Users manage own courses"
  on public.courses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tasks
create policy "Users manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Study sessions
create policy "Users manage own study sessions"
  on public.study_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Profiles: a user reads and updates their own profile.
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allows the app to lazily create a profile row (e.g. for signups
-- that predate the on_auth_user_created trigger).
create policy "Users create own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- -------------------------------------------------------------
-- END OF V1 SCHEMA
-- -------------------------------------------------------------