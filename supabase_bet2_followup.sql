-- ============================================================
-- Bet #2 follow-up: one closing question + optional email opt-in
-- ============================================================
-- This is deliberately a SEPARATE table from bet2_responses:
--
--   * bet2_responses stays completely free of contact details, so the
--     results the team reads, charts and shares with KP carry no personal
--     information, exactly as before.
--   * the two tables join on the random `respondent` id the survey already
--     generates, so we can email someone their own picks without ever
--     storing an address in the same row as the picks.
--
-- Access is TIGHTER than the responses table on purpose:
--   * ANYONE (no sign-in) can SUBMIT   -> the public survey link works
--   * only the TEAM can READ            -> invited KP viewers (Sheila, Amy,
--     Tamer) can see survey results but never respondent emails
--   * only the TEAM can DELETE          -> so a deletion request can be honored
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste all -> Run.
-- Safe to re-run. Requires public.is_team() from supabase_access.sql.
--
-- BEFORE YOU RUN: make sure public.is_team() lists the real team emails. If it
-- still has the placeholder address, nobody passes it and this table will read
-- as empty for everyone. The last VERIFY query at the bottom tells you.
-- ============================================================

create table if not exists public.bet2_followups (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  respondent    text,         -- joins to bet2_responses.respondent
  email         text,         -- null unless the person chose to leave one
  top_benefit   text,         -- their own winning benefit, for context
  enabler       text,         -- answer to "what would make you actually use it"
  wants_results boolean not null default false
);

-- Fast lookup when sending someone their own result.
create index if not exists bet2_followups_respondent_idx
  on public.bet2_followups (respondent);

alter table public.bet2_followups enable row level security;

-- Clear any previous policies so this file is safe to re-run.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'bet2_followups'
  loop
    execute format('drop policy if exists %I on public.bet2_followups', p.policyname);
  end loop;
end $$;

-- Anyone (anonymous or signed-in) may submit a follow-up.
create policy "anyone can submit"
  on public.bet2_followups for insert
  to anon, authenticated
  with check (true);

-- Only the team may read. Invited viewers deliberately cannot.
create policy "team can read"
  on public.bet2_followups for select
  to authenticated
  using (public.is_team());

-- Only the team may delete, so a "please remove my email" request can be honored.
create policy "team can delete"
  on public.bet2_followups for delete
  to authenticated
  using (public.is_team());

-- ============================================================
-- VERIFY
-- ============================================================
-- 1) Am I on the team? Must return true, or this table reads as empty for you.
--    select public.is_team() as i_am_on_the_team;
--
-- 2) Policies are in place:
--    select policyname, cmd, roles from pg_policies
--    where schemaname = 'public' and tablename = 'bet2_followups' order by cmd;
--
-- 3) Everyone who asked for their results, with their picks attached:
--    select f.created_at, f.email, f.top_benefit, f.enabler, r.age, r.choices
--    from public.bet2_followups f
--    left join public.bet2_responses r on r.respondent = f.respondent
--    where f.wants_results and f.email is not null
--    order by f.created_at desc;
--
-- 4) Honor a deletion request:
--    delete from public.bet2_followups where email = 'person@example.com';
