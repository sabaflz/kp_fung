-- ============================================================
-- Bet #2: public package-choice survey storage
-- ============================================================
-- Creates the table the public survey writes to, and locks it down so:
--   * ANYONE (no sign-in) can SUBMIT a response  -> the shared survey link works
--   * only SIGNED-IN people can READ responses    -> results stay with the team
--   * only the team can DELETE                     -> cleanup is protected
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste all -> Run.
-- Safe to re-run. Assumes public.is_team() already exists (from
-- supabase_viewer_access.sql). If it does not, run that file first.
-- ============================================================

create table if not exists public.bet2_responses (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  respondent text,
  choices    jsonb not null
);

alter table public.bet2_responses enable row level security;

-- Clear any previous policies so this file is safe to re-run.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'bet2_responses'
  loop
    execute format('drop policy if exists %I on public.bet2_responses', p.policyname);
  end loop;
end $$;

-- Anyone (anonymous or signed-in) may submit a survey response.
create policy "anyone can submit"
  on public.bet2_responses for insert
  to anon, authenticated
  with check (true);

-- Only signed-in people (team + invited partners) may read the responses.
create policy "signed-in can read"
  on public.bet2_responses for select
  to authenticated
  using (true);

-- Only the team may delete responses.
create policy "team can delete"
  on public.bet2_responses for delete
  to authenticated
  using (public.is_team());

-- VERIFY (optional):
-- select policyname, cmd, roles from pg_policies
-- where schemaname = 'public' and tablename = 'bet2_responses' order by cmd;
