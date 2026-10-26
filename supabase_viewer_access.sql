-- ============================================================
-- Benefits Interview Kit: read-only viewer access
-- ============================================================
-- Goal: let someone (e.g. a KP partner) sign in and READ everything,
-- while only the core team can ADD / EDIT / DELETE. The database enforces
-- this, so a viewer cannot change anything even if the UI let them try.
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste all -> Run.
-- Safe to re-run. Before you run it, do the one step below.
--
-- STEP 0 (do this first): list the exact emails people sign in with, so you
-- copy them correctly into the team list. Run this by itself and read the output:
--     select email from auth.users order by email;
-- ============================================================


-- 1) WHO IS ON THE TEAM (full read + write).
--    Put each teammate's EXACT sign-in email, lowercased. Everyone NOT in this
--    list becomes read-only at the database level. Get these right, or a
--    teammate left out of the list will lose the ability to save.
create or replace function public.is_team()
returns boolean
language sql stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'saba.f88@gmail.com'
    -- , 'derek-REPLACE@example.com'
    -- , 'ali-REPLACE@example.com'
  )
$$;


-- 2) LOCK WRITES to the team on every data table.
--    Reads stay open to any signed-in user (Part B below can tighten that).
--    This drops the old "any signed-in user can write" policies and replaces
--    them with team-only ones. It skips any table that does not exist.
do $$
declare
  t text;
  p record;
begin
  foreach t in array array['interviews', 'question_sets', 'questions', 'shares', 'settings']
  loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;
    -- remove every existing insert/update/delete policy (names vary by table)
    for p in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = t and cmd in ('INSERT', 'UPDATE', 'DELETE')
    loop
      execute format('drop policy if exists %I on public.%I', p.policyname, t);
    end loop;
    -- team-only write policies
    execute format('create policy "team can insert" on public.%I for insert with check (public.is_team())', t);
    execute format('create policy "team can update" on public.%I for update using (public.is_team())', t);
    execute format('create policy "team can delete" on public.%I for delete using (public.is_team())', t);
  end loop;
end $$;


-- VERIFY (optional): writes should now be gated by is_team().
-- select tablename, policyname, cmd from pg_policies
-- where schemaname = 'public' order by tablename, cmd;


-- ============================================================
-- OPTIONAL PART B: also restrict WHO CAN READ (team + named viewers only).
-- ------------------------------------------------------------
-- Without this, anyone who signs in can read the de-identified data (they just
-- cannot change it). Apply Part B if you want reads limited to specific people
-- and revocable: to remove someone's access later, delete their email here and
-- re-run. Make sure the team list above is correct first, or a teammate left
-- out of BOTH lists would see an empty app.
--
-- To apply Part B, remove the /* and */ around the block below and run again.
/*
create or replace function public.is_viewer()
returns boolean
language sql stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'sheila-REPLACE@example.com'
  )
$$;

do $$
declare
  t text;
  p record;
begin
  foreach t in array array['interviews', 'question_sets', 'questions', 'shares', 'settings']
  loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;
    for p in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = t and cmd = 'SELECT'
    loop
      execute format('drop policy if exists %I on public.%I', p.policyname, t);
    end loop;
    execute format('create policy "team or viewer can read" on public.%I for select using (public.is_team() or public.is_viewer())', t);
  end loop;
end $$;
*/


-- ============================================================
-- ROLLBACK (undo this file): reopen reads and writes to any signed-in user.
-- Run this block if you want to go back to the original shared-team model.
-- ------------------------------------------------------------
/*
do $$
declare
  t text;
  p record;
begin
  foreach t in array array['interviews', 'question_sets', 'questions', 'shares', 'settings']
  loop
    if to_regclass('public.' || t) is null then continue; end if;
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t
    loop execute format('drop policy if exists %I on public.%I', p.policyname, t); end loop;
    execute format('create policy "team read %1$s"   on public.%1$I for select using (auth.role() = ''authenticated'')', t);
    execute format('create policy "team write %1$s"  on public.%1$I for insert with check (auth.role() = ''authenticated'')', t);
    execute format('create policy "team update %1$s" on public.%1$I for update using (auth.role() = ''authenticated'')', t);
    execute format('create policy "team delete %1$s" on public.%1$I for delete using (auth.role() = ''authenticated'')', t);
  end loop;
end $$;
*/
