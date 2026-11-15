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
  E'Bet #3 changed shape again. Rather than only asking people what they want inside each benefit, the test becomes whether the package makes anyone act: put the flyer in front of people on Instagram, Discord, Snapchat and Facebook, and measure who takes a next step.\n\nThe flyer now points at a landing page rather than straight at the survey, so a visitor has several real next steps and we can see which one they take and how long it took.\n\nOne thing to be careful of when this is reported: the supervised interviews and the social posts have to be counted separately. A supervised flyer review and a public Instagram post have completely different denominators, and social click-through of 1 to 3% is a normal result rather than a failure. Judging a public post against a "4 of 5" bar would read a good flyer as a flop.\n\nAlso settled today, on the data: the ages missing from the first 16 survey responses were filled in from what the team remembered, which is 13 at 21 to 23, one at 18 to 20, one at 24 to 26 and one over 30. That supports "15 of 16 respondents were inside 18 to 30" and does not support any comparison between age groups, because the batch is almost entirely one band.',
  E'Bet #3 is a distribution and click test, run as two separate tracks.\n\nAGREED: the bar is 4 of 5 bullseye users clicking through within a minute, unprompted. Track 1, the five supervised users, is what that bar judges. The public posting is reported on its own and is never held against it.\n\nThe bullseye, 18 to 30, is the default view everywhere on the site, with everyone one click away. We collect every response; the finding we are after is what this age range wants, so the flyer is built from their answers too.\n\nKP and Fung come off the public-facing pages, so nobody reads the mock as a real offer from a real insurer.\n\nMeeting notes stay private to Saba for now.',
  E'Five more interviews before Monday, aimed at specifics inside the leading benefits.\n\nDecide whether the interest list is shared with KP. People left their address believing a student research team was keeping it, so the survey has to say so first if that changes.',
  'written from the working session the same day'
)
on conflict (id) do nothing;

-- ============================================================
-- THE CLASS TIMELINE
--
-- The scheduled sessions and deliverables from the ENGIN 188 syllabus,
-- so the notes carry the whole project spine and not just the weeks
-- somebody happened to write up. Firm dates, straight from the syllabus.
--
-- These record WHAT EACH SESSION CARRIES, not what was said in it. A
-- past one with nothing in its summary beyond the deliverable means
-- nobody has written it up yet, which is honest. Fill them in as you go.
--
-- Three of these are partner-facing: Partner Pitches, the Midpoint
-- Read-Out, and the Final Showcase. The weekly partner calls are NOT
-- here, because only the Nov 7 one is documented anywhere.
--
-- The syllabus says the schedule may flex, and lists three unmissable
-- days: Partner Pitches, Midpoint, and the Final Showcase.
-- ============================================================
insert into public.meeting_notes (id, meeting_date, title, kind, attendees, summary, decisions, actions, updated_by)
values
('00000000-0000-4000-8000-000000000201', '2026-09-08', 'Week 2: Partner Pitches and team formation', 'KP partners', 'Whole class, partners',
 E'Virtual session. Where the KP partnership and this team started.\n\nDeliverables: Team OS set up, meaning the canonical doc and the DRI log, plus the Mom Test quiz.\n\nOne of the three unmissable days in the syllabus. Not written up: add what you remember.', null, null, 'from the ENGIN 188 syllabus'),

('00000000-0000-4000-8000-000000000202', '2026-09-22', 'Week 4: first outreach to KP', 'KP partners', 'Saba, Derek, Ali',
 E'Focus was how to talk to humans. Deliverable: the Partner Dossier plus first outreach, and the Show Up reflection.\n\nThis is when contact with Sheila, Amy and Tamer would have begun. Not written up.', null, null, 'from the ENGIN 188 syllabus'),

('00000000-0000-4000-8000-000000000203', '2026-10-06', 'Week 6: the interview sprint', 'Class', 'Saba, Derek, Ali',
 E'Build, test, repeat. Deliverable: 10 to 15 interviews synthesized.\n\nThis is the sprint that produced the 11 interviews the final presentation draws its quotes from.', null, null, 'from the ENGIN 188 syllabus'),

('00000000-0000-4000-8000-000000000204', '2026-10-20', 'Week 8: Midpoint Read-Out', 'KP partners', 'Whole class, partners',
 E'Deliverable: the discovery read-out. One of the three unmissable days. Not written up: worth filling in, since the final builds on what was shown here.', null, null, 'from the ENGIN 188 syllabus'),

('00000000-0000-4000-8000-000000000205', '2026-10-27', 'Week 9: Small Bet #1', 'Class', 'Saba, Derek, Ali',
 E'Deliverable: Small Bet #1, plus the Navigate Conflict reflection.\n\nBet #1 is the flexible wallet test, where 5 of 5 chose the flexible wallet over a fixed bundle.', null, null, 'from the ENGIN 188 syllabus'),

('00000000-0000-4000-8000-000000000206', '2026-11-03', 'Week 10: Small Bet #2 and go-to-market', 'Class', 'Saba, Derek, Ali',
 E'Deliverables: Small Bet #2 plus the go-to-market plan, and Build Your Brand.\n\nBet #2 is the head-to-head package survey.', null, null, 'from the ENGIN 188 syllabus'),

('00000000-0000-4000-8000-000000000207', '2026-11-10', 'Week 11: Small Bet #3, adoption push begins', 'Class', 'Saba, Derek, Ali',
 E'Focus: get it used. Deliverables: Small Bet #3 and the start of the adoption push.\n\nThat adoption push is what Bet #3 became: the flyer going out across platforms with the clicks tracked.', null, null, 'from the ENGIN 188 syllabus'),

('00000000-0000-4000-8000-000000000208', '2026-11-17', 'Week 12: deck and demo', 'Class', 'Saba, Derek, Ali',
 E'Project work. Deliverables: the deck and demo, plus the Make the Call reflection.', null,
 E'Have Bet #3 numbers ready to show, with the supervised and social tracks reported separately.', 'from the ENGIN 188 syllabus'),

('00000000-0000-4000-8000-000000000209', '2026-11-24', 'Week 13: final pitch and storytelling', 'Class', 'Whole class',
 E'Virtual session. Deliverable: the canonical doc finalized.', null, null, 'from the ENGIN 188 syllabus'),

('00000000-0000-4000-8000-000000000210', '2026-12-01', 'Week 14: mock pitches', 'Class', 'Whole class',
 E'Deliverable: the Final Document, worth 20% of the grade.', null, null, 'from the ENGIN 188 syllabus'),

('00000000-0000-4000-8000-000000000211', '2026-12-08', 'Week 15: Final Showcase', 'Class', 'Whole class, partners',
 E'The Final Presentation, worth 25%. One of the three unmissable days.\n\nWhat the course anchors everything to: at least 5 real people, sourced by us and not by the partner, using a working model of the concept and completing its core task. Jeff, the SVP, cannot attend in person, so a virtual session is being scheduled for all teams. No date for that yet as of Nov 7.', null, null, 'from the ENGIN 188 syllabus')
on conflict (id) do nothing;

-- ============================================================
-- WRITTEN FROM RECORDINGS
--
-- The Nov 12 team session and the Nov 13 partner call, written from the
-- recording transcripts. The Nov 12 entry replaces the earlier version,
-- which was written from the working session before the transcript
-- existed. These two use "do update", so re-running this file refreshes
-- them. Any edits made to these two entries in the app are overwritten.
-- ============================================================
insert into public.meeting_notes (id, meeting_date, title, kind, attendees, summary, decisions, actions, updated_by)
values
(
  '00000000-0000-4000-8000-000000000106',
  '2026-11-12',
  'Team session: Bet #3 takes shape',
  'Team',
  'Saba, Derek, Ali',
  E'Team working session the day before the partner call. Written from the recording transcript, so speaker attribution is as best the recording shows.\n\nAges. The age question was added after the first version of the survey, so early responses had no age. From memory: Saba''s respondents were all 21 to 23, Ali''s were all 21 to 23, and Derek''s were 21 to 23 except one who was 19. The backfill records the early batch as 13 at 21 to 23, one at 18 to 20, one at 24 to 26 and one over 30. The age question is fixed for every response from here on.\n\nWhat David wants from Bet #3. The team read the same thing from class: less research on which benefits, more evidence of whether people show interest when nobody is surveying them, meaning a concrete action such as leaving an email. Leaving an email is useful data and stays in the survey, and it is not the bet by itself. Saba is still working on the wording of the email ask so it does not put people off.\n\nBet #3 is the last bet. Checked against the syllabus: it is due Monday and the remaining weeks are for the final presentation. The Nov 17 class is group working time on the deck and demo, not a presentation.\n\nThe flyer. The mockup follows the KP flyers Tamer sent as reference. Derek asked whether the disclaimer may say the team is working with Kaiser. The team view was no. Fung and UC Berkeley were judged unnecessary too, and left to Saba.\n\nHow it gets measured. An ad or post links to a landing page that looks like the flyer. Visits to that page are counted wherever they come from, so the click is the first measure and an email left is the second. Saba proposed telling people plainly that the package is not real yet and that their interest is what could make it real, without naming any insurer. Nobody objected.\n\nReach. Instagram, Snapchat, Discord and Facebook, plus campus. Saba has Discord channels to post in. Paid ads were raised: find out what they cost and ask the Fung program contact on Slack whether there is funding. The transcript heard the name as Priyanka; check whether this is Precious.\n\nThe hypothesis. Ali''s starting point was an ad or flyer and a count of who signs up, with the worry that a bet is meant to focus on five users. Derek brought two wordings: at least 4 of 5 bullseye users independently click a call to action to learn more within one minute of seeing the flyer, or at least 4 of 5 use the link or QR code to review eligibility, coverage details or limitations within two minutes. Saba liked the second for being specific and took both away to finalise.\n\nBenefits. Whether the package is limited to three benefits is a question for the partners. Transportation was left out on purpose: interviews and the first survey showed little interest in this age range, and adding it back on a guess would go against the data. Saba still needs, for each benefit, a list of what it could actually offer, from KP or from other insurers and companies.\n\nThe final. Start the story and skeleton now and get Sheila''s feedback on it, possibly in an extra meeting next week. She sees every team''s presentation.\n\nDeck editing test. A teammate deleted a name on slide 1 and saved, and the change did not appear for Saba. The Save button also looked as if it could not be clicked. Both were fixed afterwards.\n\nSlides for Friday were split across the seven slides the deck had then: Saba 1, 4 and 7, Derek 2 and 5, Ali 3 and 6.',
  E'AGREED: Bet #3''s bar is 4 of 5 bullseye users. The wording was finalised after the meeting as clicking through from the flyer within one minute, unprompted, which is what was presented on Nov 13.\n\nAGREED: the five supervised users are what the bar judges. They look at the flyer, click if they want to, and are asked what they thought afterwards. The wider posting is for numbers and is reported separately.\n\nAGREED: Kaiser comes off the flyer and its disclaimer.\n\nAGREED: the flyer leads to a landing page, and clicks and emails are the two things counted.\n\nAGREED: no new benefits are added to the survey on a guess. The six stay because they are the ones people engaged with.\n\nLeaving an email is data inside the survey, not the bet.\n\nMeeting notes stay private to Saba for now.',
  E'Ali: make an ad version of the flyer, using marketingexamples.com as David suggested. Look at ways to advertise it. Message the Fung program contact about funding for ads. Get more survey responses.\n\nDerek: fill in the Bet #3 document once the hypothesis is final, so it is ready for the weekend interviews. Make the canonical document more concise.\n\nSaba: finalise the hypothesis wording, remove Kaiser from the disclaimer, build the landing page and send the link, fix the deck Save button, keep working on the deck, the site and the data.\n\nEveryone: five or six more survey responses before Friday so the count passes 20. Prepare your slides for Friday. Ask the partners whether the package is limited to three benefits.',
  'written from the recording transcript'
),
(
  '00000000-0000-4000-8000-000000000107',
  '2026-11-13',
  'KP partner call: Bet #3 update, with Sheila',
  'KP partners',
  'Sheila, Saba, Derek, Ali. Amy and Tamer could not attend.',
  E'Weekly partner call. Amy and Tamer could not attend, so the team met with Sheila. Written from the recording transcript. The Bet #3 presentation was recorded during the call and sent to Amy and Tamer afterwards.\n\nFinal presentation. Jeff, the senior vice president who sponsors this work, was pulled to an offsite in San Diego, so Sheila has arranged for all the student teams to present to him and his team. She asked for a draft deck early enough that she, Tamer and Amy can give feedback and the team still has a weekend to revise before the showcase on Dec 8.\n\nStanding apart from the other team. The team asked for a session with Sheila on how to open the pitch, to avoid overlapping with the group working on members who age off a parent''s plan at 26. Sheila''s answer: that group is an independent study and its question is how to keep those members through their first 90 days. Ours is supplemental benefits. Her advice was to go back to the original problem statement from Jeff and the executives and frame the pitch tightly around it. She will meet separately once there is a draft deck and positioning to react to, before it goes to Amy and Tamer.\n\nTamer''s feedback, read out by Sheila. The flyer and the interview recap deck are coming together. His concern is that some of the benefits look generic and would be covered anywhere as part of a medical or dental plan. He likes everyday health because it is more unique, calls the other two run of the mill, and wants Amy''s view.\n\nSheila''s read of the flyer. The research is sound. The problem is positioning: dental and mental health are essentially covered by KP and by competitors, so they do not give anyone a reason to choose KP. Everyday health is unique and should stay. Therapy and mental health may have an angle for this age group and is a question for Amy and Tamer. Dental and vision are offered much the same everywhere, so she would look at replacing them. She named dermatology, physical therapy and transportation as possibilities. Her point was that this should be thought through before the flyer goes out, so the team collects something Amy and Tamer do not already know.\n\nThe team''s answers. It has been hard to find out what KP and others already cover, and the team cannot promise benefits that may not be feasible. Dermatology and physical therapy were in the first, longer survey and drew little engagement, which is how the current six were chosen. Gym and fitness also ranked well. Saba offered to keep the survey running with dental and vision swapped for transportation, dermatology and physical therapy.\n\nTwo ways forward came out of it. One is to test further offerings that could set KP apart. The other, raised by Ali and accepted by Sheila as a question, is that the common benefits might still work if they are marketed differently to this age group.\n\nHow to frame it in the final, in Sheila''s words: the evidence shows vision and dental are in highest demand, they are also the most commonly offered, so the team went a step further and tested additional offerings that might set KP apart.\n\nDemo. Saba walked through the survey, the email step at the end, the landing page with its four ways in, and the page that counts views, clicks, survey starts and emails. Sheila liked it and asked for a short recorded demo for Amy and Tamer that includes the tracking. Her one worry is that every extra step between the flyer and the survey loses people, so she wants their view on the collection process.\n\nTargets. Sheila asked when the survey closes and how many responses the team is aiming for. No number is set yet. Saba said the first week of posting will show what is realistic. Sheila hopes for 50 to 100 or more, and expects it promoted through clubs and other groups as well as the social platforms.',
  E'AGREED: dental and vision are not swapped out of the survey or the flyer until Amy and Tamer confirm the direction.\n\nAGREED: the questions go to Amy and Tamer by email through Sheila, with the recording, so the team does not have to wait for the next call.\n\nAGREED: no extra meeting unless their answers leave open questions. Otherwise the next call is at the usual time next week.\n\nSheila will meet separately on the final pitch once there is a draft deck.\n\nNot settled: which benefits go on the flyer, whether the package is limited to three, and the survey''s closing date and target.',
  E'Questions sent to Amy and Tamer, written down by Ali:\n1. Dental and vision are common across insurers. Should we replace them, move to the next benefits in demand, or leave them in because that is what the research shows? What would you want tested from your own research, for example transportation?\n2. Should the package stay at three benefits, or is there room for more? Is there a limit on how many KP can include?\n3. This is the data we have collected. How should we position it so it is useful for your future product planning?\n4. Here is our process, from flyer to landing page to survey. Do you have feedback on how we are collecting the data?\n\nSheila: forward the questions and the recording to Amy and Tamer and pass back their answers.\n\nSaba: send the recording (done). Record a short demo of the flyer, landing page, survey and tracking for Amy and Tamer.\n\nTeam: hold the benefit swap until they answer. Keep promoting the survey, including through clubs. Prepare a draft final deck for Sheila, Tamer and Amy with enough time to revise before Dec 8.',
  'written from the recording transcript'
)
on conflict (id) do update set
  meeting_date = excluded.meeting_date, title = excluded.title, kind = excluded.kind,
  attendees = excluded.attendees, summary = excluded.summary, decisions = excluded.decisions,
  actions = excluded.actions, updated_by = excluded.updated_by, updated_at = now();

-- ============================================================
-- VERIFY
--   select meeting_date, kind, title from public.meeting_notes order by meeting_date desc;
--   select policyname, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'meeting_notes' order by cmd;
-- ============================================================
