-- ============================================================
-- PUBLIC BENEFIT SUMMARY, for the landing page and the flyer.
--
-- THE BUG THIS FIXES: /plan and the flyer show "the top three benefits
-- from the survey", and they read bet2_responses directly to get them.
-- But nobody can read that table without signing in, and the landing
-- page is public. So every real visitor was quietly shown the hardcoded
-- fallback list instead of the survey results. It looked correct to the
-- team only because the team is signed in.
--
-- THE FIX: one function that returns the win rate per benefit and
-- nothing else. No rows, no ages, no emails, no individual picks. It is
-- security definer so it can read the table on the caller's behalf, and
-- it returns six numbers, so there is nothing in the output to leak.
--
-- The maths matches the dashboard exactly: each PERSON gets one win rate
-- per benefit, and the figure reported is the average across people. One
-- person's ten picks are not ten independent opinions.
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste ->
-- Run. Safe to re-run. Run supabase_access.sql first.
-- ============================================================

create or replace function public.benefit_win_rates()
returns table (benefit_id text, win_rate numeric, people integer)
language sql
stable
security definer
set search_path = public
as $$
  with screens as (
    -- One row per head-to-head screen, per person.
    --
    -- BULLSEYE ONLY. The flyer is aimed at 18 to 30 year olds, so the three
    -- benefits on it come from what that group chose, not from everybody.
    -- We still collect every response; this is about which answer the public
    -- page is built on. A response with no age recorded cannot be placed in
    -- the group and is left out here.
    --
    -- The dash below is an EN DASH, matching BULLSEYE_AGES in
    -- src/data/packages.js. A hyphen would silently match nothing and the
    -- page would fall back to its hardcoded list with no error anywhere.
    select r.id as rid,
           coalesce(ch -> 'left',  '[]'::jsonb) as left_side,
           coalesce(ch -> 'right', '[]'::jsonb) as right_side,
           coalesce(ch ->> 'chosen', 'left')    as chosen
      from public.bet2_responses r
      cross join lateral jsonb_array_elements(r.choices) ch
     where jsonb_typeof(r.choices) = 'array'
       and r.age in ('18–20', '21–23', '24–26', '27–30')
  ),
  flat as (
    -- Benefits on the side they picked: a win.
    select rid, bid, true as won
      from screens
      cross join lateral jsonb_array_elements_text(
        case when chosen = 'right' then right_side else left_side end) as t(bid)
    union all
    -- Benefits on the side they passed over: shown, not won.
    select rid, bid, false
      from screens
      cross join lateral jsonb_array_elements_text(
        case when chosen = 'right' then left_side else right_side end) as t(bid)
  ),
  per_person as (
    select rid,
           bid,
           count(*)::numeric                      as shown,
           count(*) filter (where won)::numeric    as won
      from flat
     group by rid, bid
  )
  select bid,
         round(avg(won / shown), 4),
         count(*)::integer
    from per_person
   where shown > 0
   group by bid
   order by 2 desc, 1;
$$;

-- The landing page has no sign-in, so anon must be able to call it.
grant execute on function public.benefit_win_rates() to anon, authenticated;

-- ============================================================
-- CHECK IT WORKED. Expect six rows, highest win rate first, and the same
-- order the Bet #2 page shows with its Bullseye toggle on, which is how
-- that page now opens. The `people` column counts bullseye respondents,
-- so it is smaller than your total response count.
-- ============================================================
select * from public.benefit_win_rates();
