import { useEffect, useMemo, useState } from 'react'
import { snapBenefits } from '../data/pool.js'
import { coverageBucket, situationBucket, useBucket, choiceBucket } from '../data/buckets.js'

// Short display labels for the survey's single-select questions, matched by a
// keyword in the full option text so the charts stay readable.
const FLEX_MAP = [
  ['predetermined', 'One set benefit for all'],
  ['choose one benefit', 'Pick one from a list'],
  ['flexible allowance', 'Flexible allowance'],
  ['combination', 'Standard plus some choice'],
  ['no preference', 'No preference'],
]
const INFLUENCE_MAP = [
  ['major factor', 'A major factor'],
  ['somewhat', 'Somewhat'],
  ['minor factor', 'A minor factor'],
  ['would not influence', 'No influence'],
  ['not sure', 'Not sure'],
]
const BARRIER_MAP = [
  ['not need it', 'Would not need it'],
  ['not know how', 'Would not know how'],
  ['not have enough time', 'Not enough time'],
  ['not cover enough', 'Would not cover enough'],
  ['too complicated', 'Process too complicated'],
  ['another provider', 'Prefer another provider'],
  ['quality', 'Quality or privacy worry'],
  ['nothing significant', 'Nothing would stop me'],
]
// "Why top choice" is multi-select, so count each option as a substring, which
// is robust to how Google joins multiple answers in one cell. Exported so the
// dashboard can bucket the interview free-text field the same way.
export const WHY_OPTS = [
  ['already spend', 'Already spend on it'],
  ['currently have this need', 'Have the need, still unmet'],
  ['prevent future', 'Prevents future problems'],
  ['save me time', 'Saves time or is easier'],
  ['reduce financial stress', 'Reduces financial stress'],
  ['realistically use', 'Would realistically use it'],
  ['quality of life', 'Improves quality of life'],
  ['does not adequately', 'Plan does not cover it well'],
]

/* Turn any Google Sheets URL into a CSV endpoint the browser can fetch. */
export function csvEndpoint(url) {
  const u = (url || '').trim()
  if (!u) return ''
  if (u.includes('/pub')) return u.includes('output=csv') ? u : u + (u.includes('?') ? '&' : '?') + 'output=csv'
  const m = u.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (m) return `https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq?tqx=out:csv`
  return u
}

/* Minimal CSV parser (handles quotes, commas and newlines inside fields). */
function parseCSV(text) {
  const rows = []; let row = []; let field = ''; let i = 0; let q = false
  while (i < text.length) {
    const c = text[i]
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue } q = false; i++; continue }
      field += c; i++; continue
    }
    if (c === '"') { q = true; i++; continue }
    if (c === ',') { row.push(field); field = ''; i++; continue }
    if (c === '\r') { i++; continue }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue }
    field += c; i++
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

/* Fetch + analyze the published survey CSV. Returns tallies the UI can chart. */
export function useSurvey(csvUrl) {
  const [raw, setRaw] = useState(null)
  const [state, setState] = useState('idle') // idle | loading | ok | error
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!csvUrl) { setRaw(null); setState('idle'); return }
    let cancelled = false
    setState('loading'); setErr('')
    fetch(csvEndpoint(csvUrl))
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text() })
      .then((text) => {
        if (cancelled) return
        const rows = parseCSV(text)
        setRaw({ header: rows[0] || [], rows: rows.slice(1).filter((r) => r.some((c) => c && c.trim())) })
        setState('ok')
      })
      .catch((e) => { if (cancelled) return; setErr(e.message || 'fetch failed'); setState('error') })
    return () => { cancelled = true }
  }, [csvUrl])

  const analysis = useMemo(() => {
    const H = (raw?.header || []).map((h) => (h || '').toLowerCase())
    // A Google Form that was edited keeps the old (now empty) columns and adds
    // new ones for the current questions, and the same question text can appear
    // more than once. So match by keyword, then pick the matching column that
    // actually has answers.
    const dataCount = (i) => raw ? raw.rows.reduce((a, r) => a + ((r[i] || '').trim() ? 1 : 0), 0) : 0
    const find = (kw) => {
      let best = -1, bestN = -1
      H.forEach((h, i) => {
        if (!kw.some((k) => h.includes(k))) return
        const c = dataCount(i)
        if (c > bestN) { bestN = c; best = i }
      })
      return best
    }
    const col = {
      age: find(['what is your age']),
      want: find(['which three', 'most want']),
      top: find(['number one priority', 'your number one']),
      use: find(['no additional cost', 'how likely would you be to use']),
      choose: find(['includes your number one supplemental benefit']),
      coverage: find(['currently receive health insurance', 'how are you covered']),
      situation: find(['current situation', 'best describes your current']),
      flex: find(['300 per year', 'additional health or wellness support', '$300']),
      influence: find(['influence your plan choice', 'how much would supplemental benefits']),
      barrier: find(['biggest reason you might not use', 'not use your number one benefit']),
      why: find(['why is that benefit your top choice']),
    }
    const vals = (i) => (i < 0 || !raw) ? [] : raw.rows.map((r) => (r[i] || '').trim()).filter(Boolean)
    const tally = (arr) => { const m = {}; for (const v of arr) m[v] = (m[v] || 0) + 1; return Object.entries(m).sort((x, y) => y[1] - x[1]) }
    // Bucket a column's values into shared categories, counted per bucket.
    const bucketTally = (i, fn) => {
      const m = {}
      for (const v of vals(i)) { const b = fn(v); if (b) m[b] = (m[b] || 0) + 1 }
      return Object.entries(m).sort((x, y) => y[1] - x[1])
    }
    // Single-select: map each answer to a short label, then count.
    const short = (v, map) => { const t = (v || '').toLowerCase(); for (const [kw, l] of map) if (t.includes(kw)) return l; return (v || '').trim() }
    const labelTally = (i, map) => {
      const m = {}
      for (const v of vals(i)) { const l = short(v, map); if (l) m[l] = (m[l] || 0) + 1 }
      return Object.entries(m).sort((x, y) => y[1] - x[1])
    }
    // Multi-select: count every option whose keyword appears in the cell.
    const multiTally = (i, opts) => {
      const m = {}
      for (const v of vals(i)) { const t = (v || '').toLowerCase(); for (const [kw, l] of opts) if (t.includes(kw)) m[l] = (m[l] || 0) + 1 }
      return Object.entries(m).sort((x, y) => y[1] - x[1])
    }

    const topMap = {}
    for (const v of vals(col.top)) { const c = snapBenefits(v)[0]; if (c) topMap[c] = (topMap[c] || 0) + 1 }
    const wantMap = {}
    for (const v of vals(col.want)) for (const c of snapBenefits(v)) wantMap[c] = (wantMap[c] || 0) + 1

    return {
      responses: raw ? raw.rows.length : 0,
      topMap,
      top: Object.entries(topMap).sort((x, y) => y[1] - x[1]),
      want: Object.entries(wantMap).sort((x, y) => y[1] - x[1]),
      age: tally(vals(col.age)),
      use: bucketTally(col.use, useBucket),
      choose: bucketTally(col.choose, choiceBucket),
      coverage: bucketTally(col.coverage, coverageBucket),
      situation: bucketTally(col.situation, situationBucket),
      flex: labelTally(col.flex, FLEX_MAP),
      influence: labelTally(col.influence, INFLUENCE_MAP),
      barrier: labelTally(col.barrier, BARRIER_MAP),
      why: multiTally(col.why, WHY_OPTS),
    }
  }, [raw])

  return { state, err, ...analysis }
}
