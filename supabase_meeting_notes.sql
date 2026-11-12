-- ============================================================
-- meeting_notes: one row per meeting, for the Meetings tab.
--
-- TEAM ONLY, on purpose. These are the team's working notes on calls with
-- the KP partners, with David, and with each other. Invited KP viewers
-- (Sheila, Amy, Tamer) cannot read, add, or change them: every policy below
-- checks public.is_team().
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste all -> Run.
-- Safe to re-run. Requires public.is_team() from supabase_access.sql.
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

-- WHO CAN SEE THESE: nobody but Saffron. That is set in
-- supabase_access.sql, which owns access for every table, and it is
-- deliberately NOT set here. Two files writing policies for the same
-- table means whichever ran last wins, and this one used to grant the
-- whole team read access, so re-running it after a change would have
-- quietly reopened the notes to Derek and Ali.
--
-- If the notes are ever opened up, change the meeting_notes branch in
-- supabase_access.sql from is_owner() to is_team(). Not here.

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
-- RECONSTRUCTED ENTRIES
--
-- These three are built from the written record (the Bet #2 write-up, the
-- Bet #3 plan, and the project docs), not from notes taken at the time.
-- Each summary says where it came from, so a reconstructed entry is never
-- mistaken for something written in the room. Check the dates and the
-- attendees against your calendar and correct them in the app.
-- ============================================================
insert into public.meeting_notes (id, meeting_date, title, kind, attendees, summary, decisions, actions, updated_by)
values
(
  '00000000-0000-4000-8000-000000000104',
  '2026-11-09',
  'Bet #2 checkpoint, end of sprint',
  'Other',
  'Saba, Derek, Ali',
  E'Milestone rather than a meeting: the deadline the Nov 7 partner call set, which was 20 survey responses and 5 more interviews.\n\nWhere Bet #2 actually stood, with 10 responses and 100 choices recorded:\n\nDental 65%, Vision 51%, Everyday health 49%, Gym and fitness 47%, Therapy and mental health 45%, Nutrition 43%.\n\nShort of the 20-response goal. Dental was the only benefit meaningfully above 50%. Second through fifth sat within six points of each other, which at 10 people is noise.\n\nOne structural point worth remembering when reading any of these numbers: each screen splits the six benefits three against three, so the six rates always average 50% and a strong leader mechanically pulls the others down. A benefit at 45% is behind the field, not unwanted.\n\nReconstructed from the Bet #3 plan. Confirm whether the team actually met on this date.',
  E'Our prediction was half right: we predicted dental plus either fitness or everyday health. Dental led, and neither partner benefit separated from the pack.\n\nSecond and third place are not decided, and we say so before a partner asks.',
  E'Carry on collecting toward a sample where the leader separates from a coin flip.',
  'reconstructed from the Bet #3 plan'
),
(
  '00000000-0000-4000-8000-000000000105',
  '2026-11-11',
  'David: stop asking about price',
  'Class',
  'David, Saba',
  E'David''s guidance was that asking someone whether they would pay a given amount for a benefit is a leading question, so it has to come out of the research. Our plan until then had been to test willingness to pay directly, working toward a $10 to $25 a month target.\n\nThat removed the planned Bet #3 and left a real gap, which turned out to be the more useful question: Bet #2 ranks six labels, and a label is not something anyone can build. We had already seen the labels mislead, when Tamer read our fitness benefit as a gym membership when we meant something broader.\n\nSame day: walked the KP Shop Plans flow and captured what a 25-year-old actually sees. The cheapest plan was Bronze 60 HMO at $421.91 a month with an $8,200 deductible, and dental, vision, fitness and anything like an everyday allowance do not appear in the benefit highlights at all.\n\nReconstructed from the Bet #3 plan, written the same day.',
  E'No price questions anywhere in the research. Willingness to pay, if it is ever tested, is tested through behaviour rather than by asking.\n\nBet #3 becomes making the benefits specific rather than pricing them.\n\nRename our "everyday health" benefit before the final: KP already sells a plan called Everyday Care and the two will be confused.',
  E'Saba: strip the price question out of the survey (done).\n\nTeam: in the remaining interviews, when someone picks a category, ask what they would want inside it, including amounts and visit counts.\n\nAsk Amy how a $300 flexible allowance would sit alongside KP rewards, which already offers members real dollars and names Gen Z as a target.',
  'reconstructed from the Bet #3 plan'
),
(
  '00000000-0000-4000-8000-000000000106',
  '2026-11-12',
  'Bet #3 becomes a distribution test',
  'Team',
  'Saba, Derek, Ali',
  E'Bet #3 changed shape again. Rather than only asking people what they want inside each benefit, the test becomes whether the package makes anyone act: put the flyer in front of people on Instagram, Discord, Snapchat and Facebook, and measure who takes a next step.\n\nThe flyer now points at a landing page rather than straight at the survey, so a visitor has several real next steps and we can see which one they take and how long it took.\n\nOne thing to be careful of when this is reported: the supervised interviews and the social posts have to be counted separately. A supervised flyer review and a public Instagram post have completely different denominators, and social click-through of 1 to 3% is a normal result rather than a failure. Judging a public post against a "4 of 5" bar would read a good flyer as a flop.\n\nAlso settled today, on the data: the ages missing from the first 16 survey responses were filled in from what the team remembered, which is 14 at 21 to 23 plus one 24 to 26 and one over 30. That supports "15 of 16 respondents were inside 18 to 30" and does not support any comparison between age groups, because the batch is almost entirely one band.',
  E'Bet #3 is a distribution and click test, run as two separate tracks.\n\nKP and Fung come off the public-facing pages, so nobody reads the mock as a real offer from a real insurer.\n\nMeeting notes stay private to Saba for now.',
  E'Team: agree the Bet #3 hypothesis and the bar before anything is posted. Every word of it is still a draft.\n\nFive more interviews before Monday, aimed at specifics inside the leading benefits.\n\nDecide whether the interest list is shared with KP. People left their address believing a student research team was keeping it, so the survey has to say so first if that changes.',
  'written from the working session the same day'
)
on conflict (id) do nothing;

-- ============================================================
-- VERIFY
--   select meeting_date, kind, title from public.meeting_notes order by meeting_date desc;
--   select policyname, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'meeting_notes' order by cmd;
-- ============================================================
