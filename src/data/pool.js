// The question pool. Each: [id, group, text]
export const POOL = [
  ['Q1','Warm-up','Tell me a bit about your current situation. Are you working, in school, both?'],
  ['Q2','Warm-up','How are you covered for health insurance right now, and how did you end up on that plan?'],
  ['Q3','Behavior','Walk me through the last time you dealt with anything health-related (a prescription, an appointment, a coverage question). What did you actually do?'],
  ['Q4','Behavior','When was the last time you used your health insurance for anything? What was that like?'],
  ['Q5','Behavior','Have you ever needed care and put it off or skipped it? What happened?'],
  ['Q6','Behavior','How do you even know what your plan covers? Have you ever looked?'],
  ['Q7','Aging-off','Do you know what happens to your coverage when you turn 26? How did you find out?'],
  ['Q8','Aging-off','Has anyone actually talked to you about the transition, like a parent, school, or your insurer? Walk me through that.'],
  ['Q9','Aging-off','(Past 26) What did you actually do when you aged off? Talk me through that whole stretch.'],
  ['Q10','Friction','What is the most annoying or confusing thing about dealing with your health coverage?'],
  ['Q11','Friction','When something about insurance confuses you, what do you do? Who do you ask?'],
  ['Q12','Friction','Is there anything health-related you wish was easier or someone just handled for you?'],
  ['Q13','Benefits','Beyond basic medical coverage, what supplemental benefits would you be most interested in? (let them answer open, then show the list)'],
  ['Q14','Benefits','Of the benefits you named, which ONE would matter most to you? Why?'],
  ['Q15','Benefits','Tell me about the last time you spent your own money on something health-related that insurance did not cover.'],
  ['Q16','Flexibility','Would you rather have a set package chosen for you, or a flexible allowance you spend on benefits you pick yourself? Why?'],
  ['Q17','Flexibility','If you got a monthly wellness allowance, what would you most want to spend it on?'],
  ['Q18','Decision','Two plans cost about the same. How much would better supplemental benefits influence which one you pick?'],
  ['Q19','Decision','What is one benefit that could actually make you choose or stay with one health plan over another?'],
  ['Q20','Self-care','What do you do to support your health outside of seeing a doctor? Any apps or services?'],
  ['Q21','Close','Who else should I talk to who is in a similar spot?'],
  ['Q22','Close','Is there anything I should have asked but did not?'],
  ['Q23','Ranking','Here are five benefits. Rank your top 3 and tell me why. (gym/wellness allowance, mental health, groceries, transportation to appointments, plain-language plan guidance)'],
  ['Q24','Ranking','For your #1, why that one? (already spend on it / cannot afford it / would realistically use it / prevents future problems / saves time / reduces stress / your plan does not cover it well)'],
  ['Q25','Benefits','Is there a benefit you wish plans offered people your age but rarely do?'],
  // --- Added from the team survey: the items that dig deeper than the pool already did ---
  ['Q26','Benefits','As far as you know, which of these does your plan already cover: dental, vision, mental health, virtual visits, prescriptions, gym or fitness, nutrition, an over-the-counter allowance, health rewards, help with bills? And are you sure, or guessing?'],
  ['Q27','Benefits','Over the past year, what health or wellness things did you most wish you had help with, whether that is paying for them or just figuring them out?'],
  ['Q28','Ranking','Here are the ten benefits a plan could add. Which three would you actually want? (Additional mental health support, Fitness reimbursement, Personalized nutrition support, Expanded dental coverage, Enhanced vision allowance, Everyday health allowance, Additional prescription savings, Expanded virtual care, Healthcare financial guidance, Additional health rewards)'],
  ['Q29','Decision','If your top one were free starting tomorrow, how likely are you to actually use it this year? Be honest with me.'],
  ['Q30','Friction','What is the most likely reason you would NOT end up using it, even for free? (would not know how, no time, too complicated, would not cover enough, a quality or privacy worry)'],
  ['Q31','Decision','Say that benefit added five dollars a month to your plan. Still worth it to you? What about fifteen?'],
]

export const BY_ID = Object.fromEntries(POOL.map(q => [q[0], q]))

// Built-in starter sets (always available, not stored in the DB).
export const BUILTIN_SETS = [
  { id:'builtin-discovery', name:'Discovery (default)', question_ids:['Q1','Q2','Q3','Q4','Q6','Q10','Q11','Q12','Q21','Q22'], note:'First talk with someone new. Understand their real relationship with coverage. Do not pitch.', builtin:true },
  { id:'builtin-aging', name:'Aging-off focus', question_ids:['Q1','Q2','Q7','Q8','Q9','Q10','Q12','Q21'], note:'For people near or past 26, or on a parent’s plan. Digs into the transition trigger.', builtin:true },
  { id:'builtin-ranking', name:'Benefit-ranking round', question_ids:['Q1','Q2','Q13','Q23','Q24','Q16','Q18','Q25'], note:'Second-round. Tests which of the five benefits actually moves them.', builtin:true },
  { id:'builtin-deepdive', name:'Benefit deep-dive (survey-aligned)', question_ids:['Q1','Q2','Q26','Q27','Q28','Q14','Q24','Q29','Q30','Q31','Q22'], note:'Mirrors the team survey funnel in a live conversation: current coverage, unmet needs, the ten-benefit menu, would-they-use-it, the barrier, and the five-dollar test.', builtin:true },
  { id:'builtin-quick', name:'Quick (15 min)', question_ids:['Q2','Q3','Q10','Q13','Q18','Q31','Q22'], note:'When you only have fifteen minutes. The essentials, now with the willingness-to-pay test.', builtin:true },
]

// The field definitions for an interview record.
export const FIELDS = [
  ['interview_date','Date','e.g. 10/13'],
  ['interviewer','Interviewer',''],
  ['who','Who (role / context, no name)','age range + student/working + context'],
  ['plan','Current plan','SHIP, Aetna, parent’s plan…'],
  ['got_it','How they got it','chose / parent’s / school default / free'],
  ['awareness','Coverage awareness','high / partial / low + a detail'],
  ['last_use','Last time they used it',''],
  ['services','Services used most',''],
  ['benefits_want','Benefits they want',''],
  ['top_benefit','Top benefit',''],
  ['workaround','Workaround','family, ChatGPT, calling insurer, apps…'],
  ['friction','Friction / pain point',''],
  ['surprise','One surprise',''],
  ['quote','Best quote','one short verbatim line'],
  ['followup','Follow-up needed',''],
]

export const BULLSEYE_TAGS = ['aging-off','first-time buyer','medi-cal','already independent','other']
export const STATUS_TAGS = ['logged','needs-followup','done']

// Canonical benefit categories — EXACTLY the labels in the team survey (Q6).
// Interviews record benefits from this list so interview charts and survey
// charts line up one-to-one when shown side by side.
export const BENEFITS = [
  'Additional mental health support',
  'Fitness reimbursement',
  'Personalized nutrition support',
  'Expanded dental coverage',
  'Enhanced vision allowance',
  'Everyday health allowance',
  'Additional prescription savings',
  'Expanded virtual care',
  'Healthcare financial guidance',
  'Additional health rewards',
]

// Keywords that snap free text (e.g. an AI transcript extract) onto a category.
const BENEFIT_KW = {
  'Additional mental health support': ['mental', 'therapy', 'counsel', 'psych'],
  'Fitness reimbursement': ['fitness', 'gym', 'exercise', 'workout'],
  'Personalized nutrition support': ['nutrition', 'diet', 'dietit'],
  'Expanded dental coverage': ['dental', 'teeth', 'dentist'],
  'Enhanced vision allowance': ['vision', 'glasses', 'contact', 'eye'],
  'Everyday health allowance': ['over-the-counter', 'otc', 'everyday health', 'health product', 'supplies'],
  'Additional prescription savings': ['prescription', 'medication', ' rx', 'pharmac', 'meds'],
  'Expanded virtual care': ['virtual', 'telehealth', 'telemedicine', 'online visit', 'video visit'],
  'Healthcare financial guidance': ['bill', 'financial', 'medical cost', 'navigat', 'understand cost', 'cost help'],
  'Additional health rewards': ['reward', 'incentive', 'cash back', 'points'],
}

// Return the canonical categories named in a chunk of free text.
export function snapBenefits(text) {
  const t = (text || '').toLowerCase()
  return BENEFITS.filter((b) => t.includes(b.toLowerCase()) || BENEFIT_KW[b].some((k) => t.includes(k)))
}
// Best single canonical category for a short phrase, else the trimmed text.
export function snapTopBenefit(text) {
  return snapBenefits(text)[0] || (text || '').trim()
}

// The extraction prompt teammates paste into any AI assistant.
export const EXTRACT_PROMPT = `You are helping a UC Berkeley research team (Fung x KP Benefits) capture user interviews about supplemental health benefits for young adults ages 18 to 30. I will paste an interview transcript below. It may be raw dialogue or an AI summary.

Return the fields below, one per line, as "Field: value". Keep each short. If something is not in the transcript, write "N/A". Never invent details. Do not include the person's real name. Use a short role/context description instead.

Date:
Interviewer:
Who (role/context, no name):
Current plan:
How they got it:
Coverage awareness:
Last time they used it:
Services used most:
Benefits they want:
Top benefit:
Workaround:
Friction / pain point:
One surprise:
Best quote:
Follow-up needed:

Transcript:
[PASTE TRANSCRIPT HERE]`
