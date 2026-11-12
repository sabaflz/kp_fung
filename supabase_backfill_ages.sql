-- ============================================================
-- BACKFILL THE MISSING AGES on the responses collected before the
-- age column existed.
--
-- WHY THIS FILE EXISTS: the survey asked for an age from the start, but
-- the database had no column to put it in, so the survey quietly saved
-- each response without one. The column exists now. These rows do not
-- have their answer any more, so the team supplied the distribution from
-- memory of who they handed the survey to.
--
-- READ THIS BEFORE YOU RUN IT. The totals below are real: the team knows
-- the mix of people they surveyed. Which age sits on which row is NOT
-- real, because that link was never saved. So these ages are sound for
-- "who did we reach" and are NOT sound for "what did the 24 to 26 group
-- prefer". The age_source column below is what keeps that distinction
-- visible instead of letting it quietly disappear.
--
-- Totals being written (from Saffron, 2026-11-12):
--     21-23     everyone the team surveyed
--     24-26     1  (Saffron's, aged 24)
--     Over 30   1  (Saffron's)
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: it only ever touches rows that have no age, so a real
-- self-reported age can never be overwritten.
-- ============================================================

-- 1. Make sure both columns exist. No-ops if you already ran the age fix.
alter table public.bet2_responses add column if not exists age text;
alter table public.bet2_responses add column if not exists age_source text;

-- 2. Anything already carrying an age came from the person themselves.
update public.bet2_responses
   set age_source = 'self'
 where age is not null and age_source is null;

-- 3. From now on, a new response is self-reported unless marked otherwise.
alter table public.bet2_responses alter column age_source set default 'self';

-- 4. Fill the blanks.
--
--    The two exceptions are given to the two oldest blank rows. That
--    choice is arbitrary and openly so: the real link between person and
--    response was never recorded, so no ordering here is more correct
--    than another. Everything else gets 21-23.
--
--    The dash in these values is an EN DASH, not a hyphen. The app
--    compares age against this exact string, so a hyphen would silently
--    drop every row out of the 18 to 30 filter.
with blanks as (
  select id, row_number() over (order by created_at, id) as rn
    from public.bet2_responses
   where age is null
)
update public.bet2_responses r
   set age = case b.rn
               when 1 then '24–26'
               when 2 then 'Over 30'
               else        '21–23'
             end,
       age_source = 'team-reported'
  from blanks b
 where r.id = b.id;

-- ============================================================
-- CHECK IT WORKED.
--
-- Expect: no rows left without an age, one 24-26, one Over 30, and the
-- rest at 21-23, all marked team-reported.
-- ============================================================
select
  coalesce(age, '(still blank)')        as age,
  coalesce(age_source, '(not marked)')  as age_source,
  count(*)                              as responses
from public.bet2_responses
group by 1, 2
order by
  array_position(
    array['Under 18','18–20','21–23','24–26','27–30','Over 30','(still blank)'],
    coalesce(age, '(still blank)')
  );
