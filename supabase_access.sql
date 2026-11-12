-- ============================================================
-- WHO CAN SEE AND CHANGE WHAT. One file, every table.
--
-- This REPLACES supabase_viewer_access.sql, which had two problems: the
-- team list was still the example placeholder, and it only covered the
-- five original tables. Every table added since (survey responses, the
-- interest list, meeting notes, the funnel, the needs questions) checks
-- public.is_team(), so a placeholder team list locks out the whole team.
--
-- THREE GROUPS:
--   team    Saffron, Derek, Ali. Read and write everything.
--   viewer  The KP partners. Read everything, change nothing.
--   public  Anyone. May SUBMIT a survey response, leave an email, or be
--           counted visiting the landing page. May read nothing.
--
-- BEFORE YOU RUN IT: fill in Derek's and Ali's sign-in emails in step 1.
-- Leaving them out does not break anything for you, but neither of them
-- will be able to save until their email is in that list.
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste ->
-- Run. Safe to re-run, and re-running is how you add or remove someone.
-- ============================================================


-- ============================================================
-- 1) THE TEAM: full read and write.
--
-- These must be the EXACT address each person signs in with, lowercased.
-- To see the real list of what people have signed in with so far:
--     select email from auth.users order by email;
-- ============================================================
create or replace function public.is_team()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    -- Saffron, all three accounts.
    'saba.f88@gmail.com',
    'saba.feilizadeh@gmail.com',
    'saba.feilizadeh@berkeley.edu',
    -- Derek Hernandez-Alonso
    'dherna-alonso05@berkeley.edu',
    -- Alexandra Arcaro
    'alexandra_arcaro@berkeley.edu'
  )
$$;


-- ============================================================
-- 2) THE VIEWERS: read everything, change nothing.
--
-- The KP partners. Remove an address here and re-run to revoke access.
-- ============================================================
create or replace function public.is_viewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'sheila.x.baxter@kp.org',
    'amy.l.benisch@kp.org',
    'tamer.m.barakat@kp.org'
  )
$$;


-- ============================================================
-- 3) APPLY IT TO EVERY TABLE.
--
-- Two kinds of table, and the difference matters:
--
--   PUBLIC INTAKE   bet2_responses, bet2_followups, landing_events.
--                   A stranger with no account must be able to write to
--                   these, or the survey and the landing page stop
--                   working. They still cannot read a single row.
--
--   TEAM WORKSPACE  everything else. No public access at all.
--
-- Reading is limited to team and viewers everywhere. Before this file,
-- survey responses could be read by ANYONE who signed in, which with
-- magic-link sign-in meant anyone with any email address.
--
-- Tables that do not exist yet are skipped, so this is safe to run
-- before you have added the later ones.
-- ============================================================
do $$
declare
  intake text[] := array['bet2_responses', 'bet2_followups', 'landing_events'];
  workspace text[] := array[
    'interviews', 'question_sets', 'questions', 'shares', 'settings',
    'meeting_notes', 'needs_questions', 'deck_content'
  ];
  t text;
  p record;
begin
  foreach t in array intake || workspace
  loop
    if to_regclass('public.' || t) is null then
      raise notice 'skipping %, table does not exist yet', t;
      continue;
    end if;

    execute format('alter table public.%I enable row level security', t);

    -- Clear every existing policy, so this file is the single source of
    -- truth rather than layering on top of whatever ran before.
    for p in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I', p.policyname, t);
    end loop;

    -- Reading: team and viewers, except the interest list.
    --
    -- bet2_followups holds the email addresses people left. The survey
    -- tells them a student research team is keeping their address to
    -- send them their own results, and says nothing about handing the
    -- list to a health insurer. So the partners do not get it by
    -- default. If the team decides to share it and says so in the
    -- survey, add bet2_followups to viewer_readable below and re-run.
    if t = 'bet2_followups' then
      execute format(
        'create policy "team can read" on public.%I for select
           to authenticated using (public.is_team())', t);
    else
      execute format(
        'create policy "team or viewer can read" on public.%I for select
           to authenticated using (public.is_team() or public.is_viewer())', t);
    end if;

    if t = any(intake) then
      -- A stranger may add a row and nothing else.
      execute format(
        'create policy "anyone can submit" on public.%I for insert
           to anon, authenticated with check (true)', t);
    else
      execute format(
        'create policy "team can insert" on public.%I for insert
           to authenticated with check (public.is_team())', t);
    end if;

    execute format(
      'create policy "team can update" on public.%I for update
         to authenticated using (public.is_team()) with check (public.is_team())', t);
    execute format(
      'create policy "team can delete" on public.%I for delete
         to authenticated using (public.is_team())', t);
  end loop;
end $$;


-- ============================================================
-- CHECK IT WORKED.
--
-- DO NOT test this with `select public.is_team()`. The SQL Editor runs
-- as the postgres role with nobody signed in, so auth.jwt() is NULL
-- here and is_team() returns false no matter who is on the list. That
-- is expected and means nothing is wrong.
--
-- Check the LIST instead. Five addresses, no example.com anywhere:
-- ============================================================
select unnest(
  regexp_matches(prosrc, '''([^'']+@[^'']+)''', 'g')
) as team_member
from pg_proc where proname = 'is_team';

select unnest(
  regexp_matches(prosrc, '''([^'']+@[^'']+)''', 'g')
) as viewer
from pg_proc where proname = 'is_viewer';

-- Then compare against who has actually signed in, so a typo in an
-- address shows up as a mismatch rather than as a silent lockout:
select email, last_sign_in_at from auth.users order by email;

-- The real test is the app itself. Open it signed in as yourself: if
-- the editing tools are there and the Bet #2 page shows responses,
-- is_team() is working.

-- Every policy now in force, one row per table per action:
select tablename, cmd, policyname
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- ============================================================
-- IF YOU LOCK YOURSELF OUT
--
-- RLS does not apply to the SQL Editor, so you can always get back in
-- here. Re-run step 1 with the correct address and you are fine. Check
-- what the function currently holds with:
--     select prosrc from pg_proc where proname = 'is_team';
-- ============================================================
