-- =============================================================
-- UniMate — V2: Google OAuth profile columns
-- Run in the Supabase SQL Editor (Dashboard > SQL > New query).
-- Idempotent — safe to run as-is.
-- =============================================================

-- 1) New profile columns populated from Google's OAuth metadata.
alter table public.profiles
  add column if not exists google_display_name text,
  add column if not exists nickname text,
  add column if not exists photo_url text;

-- 2) Extend the signup trigger so Google metadata lands in the profile
--    the moment an account is created (email signups still work: they fall
--    back to full_name / email-local-part).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    google_display_name,
    nickname,
    photo_url
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'nickname',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  );
  return new;
end;
$$;

-- 3) Backfill the new columns for accounts that exist already.
update public.profiles p
set
  photo_url = coalesce(
    u.raw_user_meta_data ->> 'avatar_url',
    u.raw_user_meta_data ->> 'picture'
  ),
  google_display_name = coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name'
  )
from auth.users u
where u.id = p.id
  and p.photo_url is null;

-- =============================================================
-- END OF V2 MIGRATION
-- =============================================================