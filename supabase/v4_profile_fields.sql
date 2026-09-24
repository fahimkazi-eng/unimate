-- ============================================================
-- V2 Phase 3 — profile fields (spec 28)
-- Run in Supabase → SQL Editor. Safe to run more than once.
-- Adds the academic/identity fields the profile page edits.
-- See supabase/v2_google_auth.sql for nickname / photo_url.
-- ============================================================

alter table public.profiles
  add column if not exists university   text,
  add column if not exists department   text,
  add column if not exists semester     smallint,
  add column if not exists academic_year smallint;

-- Nothing else needed: existing RLS UPDATE policy already scopes rows
-- to the authenticated owner (auth.uid() = id).