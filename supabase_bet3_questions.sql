-- ============================================================
-- Bet #3 interview script
--
-- Adds the Bet #3 questions to the shared question pool and saves them
-- as a set called "Bet #3 - what they actually needed", so the team can
-- pick it straight from Interviews -> Run.
--
-- Every question asks about something that already happened. None starts
-- with "would you", none mentions a price, and none describes our
-- package. That is deliberate, per David's note on leading questions.
--
-- Run in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: existing questions are left alone, and the set is
-- updated rather than duplicated.
-- ============================================================

insert into questions (id, grp, body, ord) values
  ('Q32', 'Bet #3 · Setup', 'Before we start: I am not going to describe anything we are building, and there are no right answers. I just want to hear what actually happened to you. Sound good?', 32),
  ('Q33', 'Bet #3 · Dental', 'Tell me about the last time you needed anything to do with your teeth. A cleaning, a filling, pain, a checkup you were due for. What happened?', 33),
  ('Q34', 'Bet #3 · Dental', 'What did you end up doing about it? (went and paid / used coverage / put it off / did nothing)', 34),
  ('Q35', 'Bet #3 · Dental', 'If you put it off, what was in the way? If you went, what did it end up costing you?', 35),
  ('Q36', 'Bet #3 · Vision', 'When did you last need anything for your eyes? An exam, glasses, contacts, a replacement pair. Walk me through it.', 36),
  ('Q37', 'Bet #3 · Vision', 'What did you do, and what did you pay for yourself?', 37),
  ('Q38', 'Bet #3 · Mental health', 'Tell me about a time in the last year or two when you thought about talking to someone, a therapist or a counsellor. What happened next?', 38),
  ('Q39', 'Bet #3 · Mental health', 'What made it easy or hard to actually get to that first appointment?', 39),
  ('Q40', 'Bet #3 · Movement', 'What do you currently do to stay active, and what do you pay for it? (gym, classes, climbing, a run club, an app, nothing)', 40),
  ('Q41', 'Bet #3 · Movement', 'Has there been something active you wanted to do and did not, where cost was the reason?', 41),
  ('Q42', 'Bet #3 · Everyday', 'Think about the last few months of ordinary health spending: medicine from a pharmacy, a thermometer, allergy stuff, vitamins. What have you actually bought?', 42),
  ('Q43', 'Bet #3 · Specifics', 'Of everything you have just told me about, which one did you most wish someone else had paid for? Why that one?', 43),
  ('Q44', 'Bet #3 · Specifics', 'For that thing, what would have had to be true for you to deal with it sooner?', 44),
  ('Q45', 'Bet #3 · Close', 'Is there anything health-related you have been putting off that we have not talked about?', 45)
on conflict (id) do nothing;

do $$
declare existing uuid;
begin
  select id into existing from question_sets
   where name = 'Bet #3 - what they actually needed' limit 1;
  if existing is null then
    insert into question_sets (name, question_ids, note)
    values ('Bet #3 - what they actually needed', array['Q32','Q33','Q34','Q35','Q36','Q37','Q38','Q39','Q40','Q41','Q42','Q43','Q44','Q45'], 'Past tense only. Ask what happened, what they did, and what it cost. Never ask what they would pay.');
  else
    update question_sets
       set question_ids = array['Q32','Q33','Q34','Q35','Q36','Q37','Q38','Q39','Q40','Q41','Q42','Q43','Q44','Q45'], note = 'Past tense only. Ask what happened, what they did, and what it cost. Never ask what they would pay.'
     where id = existing;
  end if;
end $$;

-- ============================================================
-- CHECK IT WORKED. Expect 14 questions and 1 set.
-- ============================================================
select
  (select count(*) from questions where id = any(array['Q32','Q33','Q34','Q35','Q36','Q37','Q38','Q39','Q40','Q41','Q42','Q43','Q44','Q45'])) as bet3_questions,
  (select count(*) from question_sets
     where name = 'Bet #3 - what they actually needed')           as bet3_sets;
