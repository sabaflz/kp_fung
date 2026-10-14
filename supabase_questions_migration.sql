-- ============================================================
-- Benefits Interview Kit: questions table migration
-- Run this ONCE in the Supabase SQL editor, after the first schema.
-- It creates the shared question pool, lets any signed-in teammate
-- add / edit / delete, turns on live sync, and seeds the starter set.
-- ============================================================

create table if not exists questions (
  id text primary key,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  grp text not null default 'Custom',   -- the group/section it belongs to
  body text not null,                    -- the question text
  ord bigint not null default 0          -- sort order
);

alter table questions enable row level security;

drop policy if exists "team read questions" on questions;
drop policy if exists "team write questions" on questions;
drop policy if exists "team update questions" on questions;
drop policy if exists "team delete questions" on questions;
create policy "team read questions"   on questions for select using (auth.role() = 'authenticated');
create policy "team write questions"  on questions for insert with check (auth.role() = 'authenticated');
create policy "team update questions" on questions for update using (auth.role() = 'authenticated');
create policy "team delete questions" on questions for delete using (auth.role() = 'authenticated');

-- Live sync. (If you ever re-run this file, this one line may error
-- because the table is already published, which is harmless.)
alter publication supabase_realtime add table questions;

-- Seed the built-in questions. Safe to re-run: existing ids are skipped.
insert into questions (id, grp, body, ord) values
  ('Q1', 'Warm-up', 'Tell me a bit about your current situation. Are you working, in school, both?', 1),
  ('Q2', 'Warm-up', 'How are you covered for health insurance right now, and how did you end up on that plan?', 2),
  ('Q3', 'Behavior', 'Walk me through the last time you dealt with anything health-related (a prescription, an appointment, a coverage question). What did you actually do?', 3),
  ('Q4', 'Behavior', 'When was the last time you used your health insurance for anything? What was that like?', 4),
  ('Q5', 'Behavior', 'Have you ever needed care and put it off or skipped it? What happened?', 5),
  ('Q6', 'Behavior', 'How do you even know what your plan covers? Have you ever looked?', 6),
  ('Q7', 'Aging-off', 'Do you know what happens to your coverage when you turn 26? How did you find out?', 7),
  ('Q8', 'Aging-off', 'Has anyone actually talked to you about the transition, like a parent, school, or your insurer? Walk me through that.', 8),
  ('Q9', 'Aging-off', '(Past 26) What did you actually do when you aged off? Talk me through that whole stretch.', 9),
  ('Q10', 'Friction', 'What is the most annoying or confusing thing about dealing with your health coverage?', 10),
  ('Q11', 'Friction', 'When something about insurance confuses you, what do you do? Who do you ask?', 11),
  ('Q12', 'Friction', 'Is there anything health-related you wish was easier or someone just handled for you?', 12),
  ('Q13', 'Benefits', 'Beyond basic medical coverage, what supplemental benefits would you be most interested in? (let them answer open, then show the list)', 13),
  ('Q14', 'Benefits', 'Of the benefits you named, which ONE would matter most to you? Why?', 14),
  ('Q15', 'Benefits', 'Tell me about the last time you spent your own money on something health-related that insurance did not cover.', 15),
  ('Q16', 'Flexibility', 'Would you rather have a set package chosen for you, or a flexible allowance you spend on benefits you pick yourself? Why?', 16),
  ('Q17', 'Flexibility', 'If you got a monthly wellness allowance, what would you most want to spend it on?', 17),
  ('Q18', 'Decision', 'Two plans cost about the same. How much would better supplemental benefits influence which one you pick?', 18),
  ('Q19', 'Decision', 'What is one benefit that could actually make you choose or stay with one health plan over another?', 19),
  ('Q20', 'Self-care', 'What do you do to support your health outside of seeing a doctor? Any apps or services?', 20),
  ('Q21', 'Close', 'Who else should I talk to who is in a similar spot?', 21),
  ('Q22', 'Close', 'Is there anything I should have asked but did not?', 22),
  ('Q23', 'Ranking', 'Here are five benefits. Rank your top 3 and tell me why. (gym/wellness allowance, mental health, groceries, transportation to appointments, plain-language plan guidance)', 23),
  ('Q24', 'Ranking', 'For your #1, why that one? (already spend on it / cannot afford it / would realistically use it / prevents future problems / saves time / reduces stress / your plan does not cover it well)', 24),
  ('Q25', 'Benefits', 'Is there a benefit you wish plans offered people your age but rarely do?', 25),
  ('Q26', 'Benefits', 'As far as you know, which of these does your plan already cover: dental, vision, mental health, virtual visits, prescriptions, gym or fitness, nutrition, an over-the-counter allowance, health rewards, help with bills? And are you sure, or guessing?', 26),
  ('Q27', 'Benefits', 'Over the past year, what health or wellness things did you most wish you had help with, whether that is paying for them or just figuring them out?', 27),
  ('Q28', 'Ranking', 'Here are the ten benefits a plan could add. Which three would you actually want? (Additional mental health support, Fitness reimbursement, Personalized nutrition support, Expanded dental coverage, Enhanced vision allowance, Everyday health allowance, Additional prescription savings, Expanded virtual care, Healthcare financial guidance, Additional health rewards)', 28),
  ('Q29', 'Decision', 'If your top one were free starting tomorrow, how likely are you to actually use it this year? Be honest with me.', 29),
  ('Q30', 'Friction', 'What is the most likely reason you would NOT end up using it, even for free? (would not know how, no time, too complicated, would not cover enough, a quality or privacy worry)', 30),
  ('Q31', 'Decision', 'Say that benefit added five dollars a month to your plan. Still worth it to you? What about fifteen?', 31)
on conflict (id) do nothing;
