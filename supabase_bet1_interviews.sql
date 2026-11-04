-- ============================================================
-- Add the 5 Bet #1 package-comparison interviews to the interviews log
-- ============================================================
-- These used a different script (Package A vs B), so some fields are N/A.
-- The useful signal (who, priorities, top benefit, quote, the flexibility
-- insight) is captured so every interview lives in one place.
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Dollar-quoted ($v$...$v$) so apostrophes and quotes need no escaping.
-- Running it twice will add duplicates, so run it only once.
-- ============================================================

insert into interviews
  (interviewer, interview_date, who, plan, awareness, benefits_want, top_benefit,
   friction, surprise, quote, bullseye, status, transcript)
values
  ($v$Saba$v$, $v$11/2$v$,
   $v$Young adult, student on a school health plan, has not dug into the details$v$,
   $v$Student health plan (SHIP)$v$,
   $v$Low, has not looked into what it covers$v$,
   $v$Dental, everyday health$v$,
   $v$Dental$v$,
   $v$Confused whether this is even insurance; unclear why gym, fitness, and nutrition count as health$v$,
   $v$Would pick the flexible $300 (Package A) unless the curated package is cheaper per service$v$,
   $v$If the same price, then I will go for package A because it's much more flexible. But in order for package B to differentiate from package A, instead of being just inferior, my assumption is that the service will be at a lower price or something per service.$v$,
   $v$other$v$, $v$logged$v$,
   $v$Bet #1 package A/B comparison (A shown first). Named dental + everyday health as priorities with reasons; leaned Package A for flexibility, gated on wanting real coverage numbers.$v$),

  ($v$Derek$v$, $v$11/2$v$,
   $v$Young adult, not engaged with own coverage, wears glasses$v$,
   $v$Own plan, low engagement$v$,
   $v$Low$v$,
   $v$Dental, vision$v$,
   $v$Vision$v$,
   $v$Misread Package B as having to pay the $300; eligibility unclear$v$,
   $v$The "use your $300" framing read clearer than the pre-split package, which felt like a cost$v$,
   $v$I saw the $300 to use however you want, whereas Package B, I assumed I was paying the $300. So [A] was more clear.$v$,
   $v$other$v$, $v$logged$v$,
   $v$Bet #1 package B/A comparison (B shown first). Chose Package A for flexibility and more options; wanted vision added; dental + vision top priorities.$v$),

  ($v$Derek$v$, $v$11/2$v$,
   $v$Student on a student health plan, moderately engaged (about 6 of 10)$v$,
   $v$Student health plan$v$,
   $v$Partial, understands the basics$v$,
   $v$Fitness, dental$v$,
   $v$Fitness$v$,
   $v$Finding a consistent provider while living between campus and home$v$,
   $v$Flexibility matters because priorities vary per person and shift over time$v$,
   $v$Everyone has different priorities and different needs at different times. They may not necessarily need vision services, but they may need everyday health, or vice versa.$v$,
   $v$other$v$, $v$logged$v$,
   $v$Bet #1 package A/B comparison. Chose Package A for more services and flexibility; noted B drops vision, nutrition, and everyday health.$v$),

  ($v$Saba$v$, $v$11/2$v$,
   $v$Berkeley student who chose their own insurance (with an uncle's help)$v$,
   $v$Self-chosen insurance$v$,
   $v$High, actively chose own plan$v$,
   $v$Vision, gym, dental$v$,
   $v$Vision$v$,
   $v$Did not know what "everyday health" meant; wanted clear coverage limits$v$,
   $v$Package B forces you to reserve money for benefits you might not use$v$,
   $v$Package B makes people reserve money for something they might not need. That's why I prefer A. It gives you much more flexibility.$v$,
   $v$already independent$v$, $v$logged$v$,
   $v$Bet #1 package B/A comparison. Chose Package A (or neither, since supplemental); suggested swapping therapy for heart or cardiology care.$v$),

  ($v$Saba$v$, $v$11/2$v$,
   $v$Young adult on a family health plan, parents choose and pay$v$,
   $v$Family plan$v$,
   $v$Low, not involved in choosing$v$,
   $v$Therapy, gym and fitness$v$,
   $v$Therapy$v$,
   $v$Wanted clear definitions and rules for each benefit$v$,
   $v$Chose the flexible option because priorities shift month to month$v$,
   $v$I definitely want the more flexible option, because depending on the month, I might want to prioritize one more than the other.$v$,
   $v$other$v$, $v$logged$v$,
   $v$Bet #1 package A/B comparison (shorter script). Priorities therapy + gym/fitness tied to everyday well-being; least likely to use vision (has 20/20).$v$);
