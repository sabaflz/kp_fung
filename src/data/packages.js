// Bet #2: pairwise benefit-package preference survey.
//
// Six candidate benefits (the ones that surfaced in Bet #1). Each screen shows
// two packages of three benefits that TOGETHER use all six (a 3-and-3 split).
// There are exactly 10 unique such splits, so the survey is 10 quick choices.
// Because every benefit is weighed against every other an equal number of
// times, each benefit gets a clean win rate at the end.
//
// Framing is intentionally generic (no insurer named), so brand does not sway
// the choice, and every benefit is spelled out so no one is left guessing.

export const BENEFITS = [
  { id: 'dental',    name: 'Dental',                 icon: 'dental',
    blurb: 'Cleanings, X-rays, and money toward fillings or other dental work.' },
  { id: 'mental',    name: 'Therapy & mental health', icon: 'mind',
    blurb: 'A set number of covered therapy or counseling sessions.' },
  { id: 'fitness',   name: 'Gym & fitness',          icon: 'fitness',
    blurb: 'A monthly credit toward a gym membership or fitness classes.' },
  { id: 'vision',    name: 'Vision',                 icon: 'vision',
    blurb: 'An eye exam plus money toward glasses or contacts.' },
  { id: 'everyday',  name: 'Everyday health',        icon: 'everyday',
    blurb: 'Over-the-counter items insurance usually skips: cold medicine, vitamins, first aid.' },
  { id: 'nutrition', name: 'Nutrition',              icon: 'nutrition',
    blurb: 'Sessions with a registered dietitian and support for healthy eating.' },
]

export const BENEFIT_BY_ID = Object.fromEntries(BENEFITS.map((b) => [b.id, b]))
export const ALL_IDS = BENEFITS.map((b) => b.id)

// Every size-3 subset of the six ids.
function combos3(arr) {
  const out = []
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      for (let k = j + 1; k < arr.length; k++)
        out.push([arr[i], arr[j], arr[k]])
  return out
}

// The 10 unique ways to split the six benefits into two groups of three.
export function buildSplits() {
  const seen = new Set()
  const splits = []
  for (const c of combos3(ALL_IDS)) {
    const comp = ALL_IDS.filter((x) => !c.includes(x))
    const key = [c.slice().sort().join(','), comp.slice().sort().join(',')].sort().join('|')
    if (seen.has(key)) continue
    seen.add(key)
    splits.push([c, comp])
  }
  return splits // length 10
}

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// One respondent's run: the 10 splits in random order, each with a random
// left/right assignment so screen position never biases the result.
export function buildSession() {
  return shuffle(buildSplits()).map(([x, y]) =>
    Math.random() < 0.5 ? { left: x, right: y } : { left: y, right: x }
  )
}

// A stable-ish anonymous id for one completed survey (no personal data).
export function newRespondentId() {
  return 'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ---- Analysis helpers (used by the team results view) ----
// Given all stored response rows, compute each benefit's win rate: the share of
// its appearances where its side was the chosen one. Every benefit appears once
// per screen, so appearances = screens answered.
export function tallyResponses(rows) {
  const wins = Object.fromEntries(ALL_IDS.map((id) => [id, 0]))
  const appear = Object.fromEntries(ALL_IDS.map((id) => [id, 0]))
  const comboPicks = {} // sorted-3-set key -> times that exact package was chosen
  let screens = 0

  for (const row of rows || []) {
    const choices = row.choices || []
    for (const ch of choices) {
      const left = ch.left || []
      const right = ch.right || []
      const chosen = ch.chosen === 'right' ? right : left
      if (!left.length || !right.length || !chosen.length) continue
      screens++
      for (const id of left) appear[id] = (appear[id] || 0) + 1
      for (const id of right) appear[id] = (appear[id] || 0) + 1
      for (const id of chosen) wins[id] = (wins[id] || 0) + 1
      const key = chosen.slice().sort().join('+')
      comboPicks[key] = (comboPicks[key] || 0) + 1
    }
  }

  const ranking = ALL_IDS
    .map((id) => ({ id, wins: wins[id], appear: appear[id], rate: appear[id] ? wins[id] / appear[id] : 0 }))
    .sort((a, b) => b.rate - a.rate)

  const topCombos = Object.entries(comboPicks)
    .map(([key, n]) => ({ ids: key.split('+'), n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5)

  return { ranking, topCombos, screens, respondents: (rows || []).length }
}
