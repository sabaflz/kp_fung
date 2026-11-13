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

// `canonical` matches the shared benefit labels in data/pool.js (BENEFITS),
// so Bet 2 win rates line up with the interview and survey charts for the
// combined Findings view.
export const BENEFITS = [
  { id: 'dental',    name: 'Dental',                 icon: 'dental',    canonical: 'Expanded dental coverage',
    blurb: 'Cleanings, X-rays, and money toward fillings or other dental work.' },
  { id: 'mental',    name: 'Therapy & mental health', icon: 'mind',     canonical: 'Additional mental health support',
    blurb: 'A set number of covered therapy or counseling sessions.' },
  { id: 'fitness',   name: 'Gym & fitness',          icon: 'fitness',   canonical: 'Fitness reimbursement',
    blurb: 'A monthly credit toward a gym membership or fitness classes.' },
  { id: 'vision',    name: 'Vision',                 icon: 'vision',    canonical: 'Enhanced vision allowance',
    blurb: 'An eye exam plus money toward glasses or contacts.' },
  { id: 'everyday',  name: 'Everyday health',        icon: 'everyday',  canonical: 'Everyday health allowance',
    blurb: 'Over-the-counter items insurance usually skips: cold medicine, vitamins, first aid.' },
  { id: 'nutrition', name: 'Nutrition',              icon: 'nutrition', canonical: 'Personalized nutrition support',
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

// ---- Deeper analysis (Bet #2 results page, flyer, and the Bet #3 plan) ----
// Everything here is computed from the stored rows, so it stays current as
// responses come in. Nothing is hard-coded.

export const BULLSEYE_AGES = ['18–20', '21–23', '24–26', '27–30']
export const isBullseyeAge = (age) => BULLSEYE_AGES.includes(age)

// Bet #2's declared bar: at least 4 of 5 people (80%) favoring the same benefit.
export const AGREEMENT_BAR = 0.8
// What we predicted would lead, written down before the survey ran.
export const PREDICTED = { anchor: 'dental', partner: ['fitness', 'everyday'] }

// Two-sided 95% t critical value. With a handful of people the normal 1.96
// would make the margin look tighter than it is.
function tCrit(df) {
  const table = [0, 12.71, 4.30, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23,
    2.20, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.10, 2.09, 2.09]
  if (df <= 0) return Infinity
  if (df < table.length) return table[df]
  if (df <= 30) return 2.04
  if (df <= 60) return 2.00
  return 1.96
}

// One person's win rate per benefit: of the screens where it appeared, how
// often they chose its side.
function personRates(row) {
  const wins = {}, appear = {}
  let screens = 0
  for (const ch of row.choices || []) {
    const left = ch.left || [], right = ch.right || []
    const chosen = ch.chosen === 'right' ? right : left
    if (!left.length || !right.length || !chosen.length) continue
    screens++
    for (const id of [...left, ...right]) appear[id] = (appear[id] || 0) + 1
    for (const id of chosen) wins[id] = (wins[id] || 0) + 1
  }
  const rates = {}
  for (const id of ALL_IDS) if (appear[id]) rates[id] = (wins[id] || 0) / appear[id]
  return { rates, screens }
}

// Bullseye is the DEFAULT everywhere, not an option you switch on. We collect
// every response, but the finding we are after is what 18 to 30 year olds want,
// so a caller has to ask for everyone explicitly rather than get them by
// accident. Callers that want the whole sample pass { bullseyeOnly: false }.
export function analyzeResponses(allRows, { bullseyeOnly = true } = {}) {
  const everyone = (allRows || []).filter((r) => (r.choices || []).length > 0)
  const rows = bullseyeOnly ? everyone.filter((r) => isBullseyeAge(r.age)) : everyone
  const people = rows.map((r) => ({ row: r, ...personRates(r) })).filter((p) => p.screens > 0)
  const n = people.length
  const partial = people.filter((p) => p.screens < 10).length

  // Benefit level. The margin of error treats each PERSON as one data point,
  // not each click: one person's ten picks are not ten independent opinions.
  const benefits = ALL_IDS.map((id) => {
    const xs = people.map((p) => p.rates[id]).filter((x) => x != null)
    const k = xs.length
    const mean = k ? xs.reduce((a, b) => a + b, 0) / k : 0
    const sd = k > 1 ? Math.sqrt(xs.reduce((a, x) => a + (x - mean) ** 2, 0) / (k - 1)) : 0
    const moe = k > 1 ? tCrit(k - 1) * sd / Math.sqrt(k) : null
    const favored = xs.filter((x) => x > 0.5).length // picked it more often than not
    const lo = moe == null ? null : Math.max(0, mean - moe)
    const hi = moe == null ? null : Math.min(1, mean + moe)
    let call = 'unclear'
    if (lo != null && lo > 0.5) call = 'ahead'
    else if (hi != null && hi < 0.5) call = 'behind'
    return { id, n: k, mean, moe, lo, hi, favored, favoredShare: k ? favored / k : 0, call }
  }).sort((a, b) => b.mean - a.mean)

  // Package level. Every one of the 20 possible three-benefit packages is shown
  // to each person exactly once, so each gets its own clean pick rate.
  const pk = {}
  for (const p of people) {
    for (const ch of p.row.choices || []) {
      const left = ch.left || [], right = ch.right || []
      if (!left.length || !right.length) continue
      const chosen = ch.chosen === 'right' ? right : left
      for (const side of [left, right]) {
        const key = side.slice().sort().join('+')
        pk[key] = pk[key] || { ids: side.slice().sort(), shown: 0, picked: 0 }
        pk[key].shown++
        if (side === chosen) pk[key].picked++
      }
    }
  }
  const packages = Object.values(pk)
    .map((x) => ({ ...x, rate: x.shown ? x.picked / x.shown : 0 }))
    .sort((a, b) => b.rate - a.rate || b.picked - a.picked)

  // By age band: who leads within each group.
  const byAge = {}
  for (const p of people) {
    const a = p.row.age || 'Not given'
    byAge[a] = byAge[a] || []
    byAge[a].push(p)
  }
  const ageOrder = ['Under 18', ...BULLSEYE_AGES, 'Over 30', 'Not given']
  const ages = ageOrder.filter((a) => byAge[a]).map((a) => {
    const g = byAge[a]
    const means = ALL_IDS.map((id) => {
      const xs = g.map((p) => p.rates[id]).filter((x) => x != null)
      return { id, mean: xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0 }
    }).sort((x, y) => y.mean - x.mean)
    return { age: a, n: g.length, top: means[0], second: means[1] }
  })

  // The verdict against what we wrote down before running the survey.
  const agreed = benefits.filter((b) => b.n > 0 && b.favoredShare >= AGREEMENT_BAR)
  const ahead = benefits.filter((b) => b.call === 'ahead')
  const leader = benefits[0]
  const runnerUp = benefits[1]
  const gap = leader && runnerUp ? leader.mean - runnerUp.mean : 0
  let verdict = 'not-yet'
  if (n >= 5 && agreed.length >= 1) verdict = 'supported'
  else if (n >= 5 && leader && leader.favoredShare >= 0.6) verdict = 'partial'
  else if (n >= 5) verdict = 'not-supported'
  const predictedAnchorLeads = leader?.id === PREDICTED.anchor
  const predictedPartnerInTop3 = benefits.slice(0, 3).some((b) => PREDICTED.partner.includes(b.id))

  return {
    n, partial, totalAll: everyone.length,
    bullseyeCount: everyone.filter((r) => isBullseyeAge(r.age)).length,
    benefits, packages, ages, agreed, ahead, leader, runnerUp, gap,
    verdict, predictedAnchorLeads, predictedPartnerInTop3,
  }
}

const pctStr = (x) => `${Math.round(x * 100)}%`
const nameOf = (id) => BENEFIT_BY_ID[id]?.name || id

// Plain-language findings, regenerated from the data every time. These are the
// lines the page shows and the "copy summary" button exports.
export function summarize(a, { bullseyeOnly = true } = {}) {
  const who = bullseyeOnly ? 'bullseye respondents (18 to 30)' : 'respondents'
  if (!a.n) return [`No ${who} yet.`]
  const out = []
  const L = a.leader
  out.push(
    `${nameOf(L.id)} leads. Across ${a.n} ${who}, the average person picked the package containing it ${pctStr(L.mean)} of the time` +
    (L.moe != null ? ` (plus or minus ${Math.round(L.moe * 100)} points).` : '.'),
  )
  out.push(
    `${L.favored} of ${L.n} people picked ${nameOf(L.id).toLowerCase()} more often than not. ` +
    `Our bar was 4 of 5 (${pctStr(AGREEMENT_BAR)}), and this is ${pctStr(L.favoredShare)}.`,
  )
  if (a.ahead.length) {
    out.push(`Clearly above a coin flip, even allowing for the margin of error: ${a.ahead.map((b) => nameOf(b.id)).join(', ')}.`)
  } else {
    out.push('No benefit is clearly above a coin flip yet once the margin of error is counted. The ranking is directional.')
  }
  const tied = a.benefits.filter((b) => b.call === 'unclear' && b.id !== L.id)
  if (tied.length >= 3) {
    out.push(`${tied.map((b) => nameOf(b.id)).join(', ')} are too close to separate. Second and third place are still open.`)
  }
  const top = a.packages[0]
  if (top) {
    const ties = a.packages.filter((p) => p.rate === top.rate)
    if (ties.length === 1) {
      out.push(`Strongest single package: ${top.ids.map(nameOf).join(' + ')}, picked ${top.picked} of the ${top.shown} times it was shown (${pctStr(top.rate)}).`)
    } else {
      const shared = ALL_IDS.filter((id) => ties.every((p) => p.ids.includes(id)))
      out.push(
        `${ties.length} packages tie for strongest at ${pctStr(top.rate)}` +
        (shared.length ? `, and every one of them contains ${shared.map((id) => nameOf(id).toLowerCase()).join(' and ')}.` : '.') +
        ' No single three-benefit package has pulled ahead yet.',
      )
    }
  }
  const bottom = a.benefits[a.benefits.length - 1]
  if (bottom && bottom.id !== L.id) {
    out.push(`${nameOf(bottom.id)} is last at ${pctStr(bottom.mean)}` + (bottom.call === 'behind' ? ', clearly below a coin flip.' : ', though not clearly below a coin flip.'))
  }
  if (a.n < 20) out.push(`Sample is ${a.n}. Our goal is 20, so treat every number here as a direction, not a result.`)
  if (a.partial) out.push(`${a.partial} of these did not finish all ten screens. Their answers are included for the screens they did complete.`)
  return out
}
