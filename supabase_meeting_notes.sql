-- ============================================================
-- meeting_notes: one row per meeting, for the Meetings tab.
--
-- TEAM ONLY, on purpose. These are the team's working notes on calls with
-- the KP partners, with David, and with each other. Invited KP viewers
-- (Sheila, Amy, Tamer) cannot read, add, or change them: every policy below
-- checks public.is_team().
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste all -> Run.
-- Safe to re-run. Requires public.is_team() from supabase_viewer_access.sql.
-- ============================================================

create table if not exists public.meeting_notes (
  id           uuid primary key default gen_random_uuid(),
  meeting_date date not null,
  title        text not null,
  kind         text not null default 'Team',  -- KP partners | Team | Class | 1-on-1 | Other
  attendees    text,
  summary      text,   -- what was discussed
  decisions    text,   -- what was decided
  actions      text,   -- who does what next
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   text
);

create index if not exists meeting_notes_date_idx
  on public.meeting_notes (meeting_date desc);

alter table public.meeting_notes enable row level security;

-- Clear any previous policies so this file is safe to re-run.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'meeting_notes'
  loop
    execute format('drop policy if exists %I on public.meeting_notes', p.policyname);
  end loop;
end $$;

create policy "team can read"
  on public.meeting_notes for select
  to authenticated using (public.is_team());

create policy "team can insert"
  on public.meeting_notes for insert
  to authenticated with check (public.is_team());

create policy "team can update"
  on public.meeting_notes for update
  to authenticated using (public.is_team()) with check (public.is_team());

create policy "team can delete"
  on public.meeting_notes for delete
  to authenticated using (public.is_team());

-- ============================================================
-- STARTER ENTRIES
-- Only what was already written down elsewhere. Fixed ids, so re-running this
-- file never duplicates them and never overwrites edits made in the app.
-- ============================================================
insert into public.meeting_notes (id, meeting_date, title, kind, attendees, summary, decisions, actions, updated_by)
values
(
  '00000000-0000-4000-8000-000000000101',
  '2026-11-07',
  'Weekly partner call',
  'KP partners',
  'Sheila, Amy, Tamer, and the team',
  E'The Bet #2 survey was live but short of its response goal, so win rates were directional only.\n\nAmy and Tamer: KP cannot design a benefit only for ages 18 to 30. The same plan is sold to everyone under 65, so anything aimed at young adults has to come from marketing and framing, not from an age-restricted benefit.\n\nTamer: do not frame the fitness allowance as a gym membership. Frame it as flexible spending the person can put toward whatever fits them, such as mobility work, climbing, or an injury-prevention program. The flexibility is the pitch.\n\nSheila: build toward a persona-driven story for the final, with a named user (for example a 25-year-old) and the specific problem they solve by choosing the package. A visual mock-up with KP''s look and feel will matter for how the final lands.\n\nJeff (SVP) cannot attend the in-person final. A virtual session is being scheduled for all teams. No date yet.',
  E'Targeting 18 to 30 happens through framing, not through a separate benefit design.\n\nThe six benefits under test stay as planned.',
  E'Team: reach at least 20 survey responses and 5 more one-on-one interviews by Mon Nov 9.\n\nTeam: in the next interviews, when someone picks a category such as gym and fitness, ask what they would want inside it.\n\nTeam: start the persona and the KP-styled mock-up as a next-phase task.',
  'starter entry, from the Bet #2 write-up'
),
(
  '00000000-0000-4000-8000-000000000102',
  '2026-11-10',
  'David: give the survey an output',
  'Class',
  'David',
  E'David suggested the survey should ask for an action at the end, so that it produces something for us beyond the answers. For example, asking people whether they want more information.\n\nLogged from Saba''s notes the same day. Confirm the date and setting.',
  E'Add an optional email ask to the end of the survey. The goal is a list of people who are interested.',
  E'Saba: add the closing question and the email opt-in to the survey (done, in the app).\n\nTeam: run the consent wording past Sheila or Amy before sharing the link again.',
  'starter entry'
),
(
  '00000000-0000-4000-8000-000000000103',
  '2026-11-18',
  '1-2-1 with David',
  '1-on-1',
  'David, Saba',
  E'Scheduled for 12:30 to 12:55pm. David asks students to come with specific questions: the design project, life after Cal, or a topic from class.',
  null,
  E'Saba: prepare questions beforehand.',
  'starter entry'
)
on conflict (id) do nothing;

-- ============================================================
-- VERIFY
--   select meeting_date, kind, title from public.meeting_notes order by meeting_date desc;
--   select policyname, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'meeting_notes' order by cmd;
-- ============================================================
