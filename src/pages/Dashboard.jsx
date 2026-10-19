import { useMemo, useState } from 'react'
import { FIELDS } from '../data/pool.js'
import { useInterviews, useSettings } from '../lib/data.js'
import { useSurvey, WHY_OPTS } from '../lib/survey.js'
import { coverageBucket, situationBucket, useBucket, choiceBucket } from '../data/buckets.js'
import { useToast, copyText } from '../components/ui.jsx'

function tally(values) {
  const m = {}
  for (const v of values) {
    const k = (v || '').trim()
    if (!k) continue
    m[k] = (m[k] || 0) + 1
  }
  return Object.entries(m).sort((a, b) => b[1] - a[1])
}

function splitMany(s) {
  return (s || '').split(/[,;\n|]/).map((x) => x.trim()).filter((x) => x.length > 1)
}

// Merge an interview tally and a survey tally into [label, iN, sN] triples,
// so one bar can show both sources stacked. Sorted by combined count.
function combineTriples(iT, sT) {
  const m = {}
  for (const [k, v] of iT) (m[k] ||= { i: 0, s: 0 }).i += v
  for (const [k, v] of sT) (m[k] ||= { i: 0, s: 0 }).s += v
  return Object.entries(m)
    .map(([label, { i, s }]) => [label, i, s])
    .sort((a, b) => (b[1] + b[2]) - (a[1] + a[2]))
}

// Bucket the free-text coverage-awareness field into three levels.
function awarenessBucket(s) {
  const t = (s || '').toLowerCase()
  if (!t) return 'Unknown'
  if (t.includes('high')) return 'High'
  if (t.includes('low')) return 'Low'
  if (t.includes('partial') || t.includes('moderate') || t.includes('50')) return 'Partial'
  return 'Unknown'
}

// Keyword-tagged recurring themes across the qualitative fields.
const THEMES = [
  ['Low coverage awareness', ['understand', 'unsure', 'not sure', 'confus', 'unfamiliar', 'navigat', 'terminolog', 'figuring', 'unclear', "don't know", 'do not know', "didn't know", 'trial and error', '25%']],
  ['Relies on a parent or family', ['mom', 'mother', 'parent', 'father', 'family']],
  ['Cost or financial barrier', ['afford', 'financial', 'out of pocket', 'out-of-pocket', 'copay', 'co-pay', 'overcharg', 'expensive', 'spending limit', 'money']],
  ['Access or wait times', ['wait', 'referral', 'specialist', 'schedul', 'delay']],
  ['Self-manages outside the plan', ['supplement', 'gym', 'myfitnesspal', 'apple health', 'meditat', 'journal', 'workout', 'home remed', 'calorie', 'tracker']],
  ['Wants proactive guidance', ['guidance', 'workshop', 'come to us', 'proactive', 'informational', 'education', 'clearer', 'more support', 'better access']],
  ['Benefits feel built for families', ['families', 'established life', 'established adult']],
]

function interviewText(r) {
  return [r.friction, r.workaround, r.awareness, r.surprise, r.quote, r.services]
    .map((x) => x || '').join(' ').toLowerCase()
}

function Bars({ data, empty, total, color }) {
  if (!data.length) return <div className="empty">{empty}</div>
  const max = data[0][1]
  return (
    <div className="bars">
      {data.map(([label, n]) => (
        <div className="bar" key={label}>
          <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{label}</span>
          <div className="track"><div className="fill" style={{ width: Math.max(6, (n / max) * 100) + '%', background: color || 'var(--accent)' }} /></div>
          <span className="v">{total ? `${n} · ${Math.round((n / total) * 100)}%` : n}</span>
        </div>
      ))}
    </div>
  )
}

// Stacked bars that follow the Both / Interviews / Survey toggle.
// data: [label, interviewN, surveyN][]. In Both view each bar shows a teal
// segment (interviews) and an orange segment (survey) sized to their counts.
function SplitBars({ data, source, iTotal, sTotal, empty }) {
  const value = (i, s) => source === 'interviews' ? i : source === 'survey' ? s : i + s
  const visible = data.filter(([, i, s]) => value(i, s) > 0)
  if (!visible.length) return <div className="empty">{empty}</div>
  const max = Math.max(1, ...visible.map(([, i, s]) => value(i, s)))
  const denom = source === 'interviews' ? iTotal : source === 'survey' ? sTotal : iTotal + sTotal
  const showIv = source !== 'survey'
  const showSv = source !== 'interviews'
  return (
    <div className="bars">
      {visible.map(([label, i, s]) => {
        const v = value(i, s)
        return (
          <div className="bar" key={label}>
            <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{label}</span>
            <div className="track">
              {showIv && i > 0 && <div className="seg" style={{ width: (i / max) * 100 + '%', background: 'var(--iv)' }} title={`${i} from interview${i === 1 ? '' : 's'}`} />}
              {showSv && s > 0 && <div className="seg" style={{ width: (s / max) * 100 + '%', background: 'var(--sv)' }} title={`${s} from survey`} />}
            </div>
            <span className="v">{denom ? `${v} · ${Math.round((v / denom) * 100)}%` : v}</span>
          </div>
        )
      })}
    </div>
  )
}

// Categorical slice colors for the interview-only donuts. Cool tones only — no
// amber or orange, so orange stays reserved for "survey" across the whole page.
const SLICE = ['#14b8a6', '#6366f1', '#0ea5e9', '#8b5cf6', '#22c55e', '#94a3b8']

function Donut({ data, total, size = 148, palette = SLICE }) {
  const r = 56, sw = 22, C = 2 * Math.PI * r, cx = size / 2, cy = size / 2
  const tot = total || data.reduce((s, [, nn]) => s + nn, 0) || 1
  let off = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="donut chart" style={{ flex: 'none' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={sw} />
      {data.map(([label, nn], i) => {
        const f = nn / tot
        const el = (
          <circle key={label} cx={cx} cy={cy} r={r} fill="none" stroke={palette[i % palette.length]} strokeWidth={sw}
            strokeDasharray={`${f * C} ${C - f * C}`} strokeDashoffset={-off * C} transform={`rotate(-90 ${cx} ${cy})`} />
        )
        off += f
        return el
      })}
      <text x={cx} y={cy - 1} textAnchor="middle" fontSize="27" fontWeight="700" fill="var(--fg)" style={{ fontVariantNumeric: 'tabular-nums' }}>{tot}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="var(--faint)">total</text>
    </svg>
  )
}

function Legend({ data, total, palette = SLICE }) {
  const tot = total || data.reduce((s, [, n]) => s + n, 0) || 1
  return (
    <div style={{ display: 'grid', gap: 9, minWidth: 0, flex: 1 }}>
      {data.map(([label, n], i) => (
        <div key={label} className="row" style={{ justifyContent: 'space-between', gap: 10, flexWrap: 'nowrap' }}>
          <span className="row" style={{ gap: 8, minWidth: 0, flexWrap: 'nowrap' }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: palette[i % palette.length], flex: 'none' }} />
            <span style={{ overflowWrap: 'anywhere', fontSize: 13 }}>{label}</span>
          </span>
          <span style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', fontSize: 12.5 }}>{n} &middot; {Math.round((n / tot) * 100)}%</span>
        </div>
      ))}
    </div>
  )
}

function DonutCard({ title, note, data, total, empty, palette }) {
  return (
    <div className="card">
      <div className="hd"><h2>{title}</h2>{note && <span className="note">{note}</span>}</div>
      <div className="bd">
        {data.length === 0 ? <div className="empty">{empty}</div> : (
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <Donut data={data} total={total} palette={palette} />
            <Legend data={data} total={total} palette={palette} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { rows, loading } = useInterviews()
  const { map } = useSettings()
  const survey = useSurvey(map.survey_csv_url)
  const toast = useToast()
  const [source, setSource] = useState('both') // both | interviews | survey

  const n = rows.length
  const totalResponses = n + survey.responses

  const stats = useMemo(() => {
    const topBenefit = tally(rows.map((r) => r.top_benefit))
    const wants = tally(rows.flatMap((r) => splitMany(r.benefits_want)))
    const plans = tally(rows.map((r) => r.plan))
    const bullseye = tally(rows.map((r) => r.bullseye))
    const needs = rows.filter((r) => r.status === 'needs-followup').length
    const done = rows.filter((r) => r.status === 'done').length
    const quotes = rows.filter((r) => r.quote)

    // coverage awareness, bucketed, ordered low -> high
    const order = { Low: 0, Partial: 1, High: 2, Unknown: 3 }
    const awareness = tally(rows.map((r) => awarenessBucket(r.awareness)))
      .sort((a, b) => (order[a[0]] ?? 9) - (order[b[0]] ?? 9))
    const lowPartial = rows.filter((r) => ['Low', 'Partial'].includes(awarenessBucket(r.awareness))).length

    // recurring themes
    const themeCounts = {}
    for (const r of rows) {
      const t = interviewText(r)
      for (const [name, kws] of THEMES) if (kws.some((k) => t.includes(k))) themeCounts[name] = (themeCounts[name] || 0) + 1
    }
    const themes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1])

    // top benefit by segment (cross-tab)
    const seg = {}
    for (const r of rows) {
      const s = (r.bullseye || '').trim() || 'untagged'
      const tb = (r.top_benefit || '').trim()
      if (!seg[s]) seg[s] = { count: 0, benefits: {} }
      seg[s].count++
      if (tb) seg[s].benefits[tb] = (seg[s].benefits[tb] || 0) + 1
    }
    const segments = Object.entries(seg).sort((a, b) => b[1].count - a[1].count)

    return { topBenefit, wants, plans, bullseye, needs, done, quotes, awareness, lowPartial, themes, segments }
  }, [rows])

  const srcNote = source === 'survey' ? `share of ${survey.responses} survey responses`
    : source === 'interviews' ? `share of ${n} interviews`
    : `share of all ${totalResponses} responses`

  // Six shared dimensions, each as [label, interviewN, surveyN] triples so a
  // single bar can stack both sources. SplitBars decides what to show per toggle.
  const iWant = {}
  for (const r of rows) for (const c of splitMany(r.benefits_want)) iWant[c] = (iWant[c] || 0) + 1
  const wantTri = combineTriples(Object.entries(iWant), survey.want || []).slice(0, 10)
  const topTri = combineTriples(tally(rows.map((r) => r.top_benefit)), survey.top || [])
  const covTri = combineTriples(tally(rows.map((r) => coverageBucket(r.plan))), survey.coverage || [])
  const sitTri = combineTriples(tally(rows.map((r) => situationBucket(r.who))), survey.situation || [])
  const useTri = combineTriples(tally(rows.map((r) => useBucket(r.would_use))), survey.use || [])
  const choTri = combineTriples(tally(rows.map((r) => choiceBucket(r.plan_choice))), survey.choose || [])
  // Interview dropdowns use the survey's own short labels, so they tally directly.
  const flexTri = combineTriples(tally(rows.map((r) => r.flex_pref)), survey.flex || [])
  const inflTri = combineTriples(tally(rows.map((r) => r.influence)), survey.influence || [])
  const barrTri = combineTriples(tally(rows.map((r) => r.barrier)), survey.barrier || [])
  // "Why" is free text in interviews: keyword-bucket it like the survey multi-select.
  const whyBucket = (texts) => {
    const m = {}
    for (const v of texts) { const t = (v || '').toLowerCase(); for (const [kw, l] of WHY_OPTS) if (t.includes(kw)) m[l] = (m[l] || 0) + 1 }
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }
  const whyTri = combineTriples(whyBucket(rows.map((r) => r.why_top)), survey.why || [])

  const COLS = [...FIELDS.map(([k, l]) => [k, l]), ['bullseye', 'Bullseye'], ['status', 'Status']]

  function table(sep) {
    const head = COLS.map(([, l]) => l).join(sep)
    const body = rows.map((r) => COLS.map(([k]) => String(r[k] ?? '').replace(/[\t\n\r]+/g, ' ')).join(sep)).join('\n')
    return head + '\n' + body
  }

  async function copySheet() {
    toast((await copyText(table('\t'))) ? 'Copied. Paste straight into Google Sheets' : 'Copy failed')
  }

  function downloadCSV() {
    const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
    const head = COLS.map(([, l]) => esc(l)).join(',')
    const body = rows.map((r) => COLS.map(([k]) => esc(r[k])).join(',')).join('\n')
    const blob = new Blob([head + '\n' + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `kp-benefits-interviews-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  if (loading) return <div className="empty"><span className="spin" /></div>

  const headline = n
    ? `Based on ${n} interview${n === 1 ? '' : 's'}` + (survey.responses ? ` and ${survey.responses} survey responses` : '') +
      `. ${Math.round((stats.lowPartial / n) * 100)}% report low or partial coverage awareness.`
    : ''

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow">Synthesis</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
            Dashboard
          </h1>
          <p className="lede">What the research is telling us, updated live as the team logs. {headline}</p>
        </div>
        <div className="row">
          <button className="btn ghost sm" onClick={copySheet} disabled={!rows.length}>Copy for Google Sheet</button>
          <button className="btn sm" onClick={downloadCSV} disabled={!rows.length}>Download CSV</button>
        </div>
      </div>

      <div className="tiles">
        <div className="tile"><div className="n">{n}</div><div className="l">interviews logged</div></div>
        <div className="tile"><div className="n">{survey.responses}</div><div className="l">survey responses</div></div>
        <div className="tile"><div className="n">{totalResponses}</div><div className="l">total responses</div></div>
        <div className="tile"><div className="n">{n ? Math.round((stats.lowPartial / n) * 100) + '%' : '—'}</div><div className="l">low/partial awareness</div></div>
        <div className="tile"><div className="n">{stats.quotes.length}</div><div className="l">quotes captured</div></div>
      </div>

      {totalResponses > 0 && (
        <>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="eyebrow">Combined view</div>
            <div className="row" style={{ gap: 6 }}>
              {[['both', 'Both'], ['interviews', 'Interviews'], ['survey', 'Survey']].map(([v, l]) => (
                <button key={v} type="button" className={'chip' + (source === v ? ' on' : '')} onClick={() => setSource(v)}>{l}</button>
              ))}
            </div>
          </div>

          {source === 'both' && (
            <div className="row" style={{ gap: 16, fontSize: 12.5, color: 'var(--muted)', marginTop: -4 }}>
              <span className="row" style={{ gap: 7 }}><span className="swatch" style={{ background: 'var(--iv)' }} />Interviews ({n})</span>
              <span className="row" style={{ gap: 7 }}><span className="swatch" style={{ background: 'var(--sv)' }} />Survey ({survey.responses})</span>
              <span style={{ color: 'var(--faint)' }}>every bar stacks both sources</span>
            </div>
          )}

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>What they want</div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div className="card">
              <div className="hd"><h2>Benefits wanted</h2><span className="note">{srcNote}</span></div>
              <div className="bd"><SplitBars data={wantTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Top benefit</h2><span className="note">{srcNote}</span></div>
              <div className="bd"><SplitBars data={topTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Who they are</div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div className="card">
              <div className="hd"><h2>How they are covered</h2><span className="note">{srcNote}</span></div>
              <div className="bd"><SplitBars data={covTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Student or working</h2><span className="note">{srcNote}</span></div>
              <div className="bd"><SplitBars data={sitTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
            What they would do <span style={{ fontWeight: 400, color: 'var(--faint)' }}>&middot; interviews fill this in going forward</span>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div className="card">
              <div className="hd"><h2>Would use it if free</h2><span className="note">{srcNote}</span></div>
              <div className="bd"><SplitBars data={useTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Pick the plan with the benefit</h2><span className="note">same cost</span></div>
              <div className="bd"><SplitBars data={choTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Choice and flexibility</div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div className="card">
              <div className="hd"><h2>If the plan had $300 to spend</h2><span className="note">set benefit vs. flexible allowance</span></div>
              <div className="bd"><SplitBars data={flexTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Do benefits sway plan choice</h2><span className="note">when cost and coverage are equal</span></div>
              <div className="bd"><SplitBars data={inflTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Why it matters, and what stops them</div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div className="card">
              <div className="hd"><h2>Why it&rsquo;s their top choice</h2><span className="note">pick several</span></div>
              <div className="bd"><SplitBars data={whyTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Reason they might not use it</h2><span className="note">even if it were free</span></div>
              <div className="bd"><SplitBars data={barrTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
          </div>

        </>
      )}

      {totalResponses === 0 && (
        <div className="card"><div className="empty">No data yet. The charts fill in as interviews and survey responses come in.</div></div>
      )}

      {n > 0 && source !== 'survey' && (
        <>
          <div>
            <div className="eyebrow">From interviews only</div>
            <p className="lede" style={{ fontSize: 13, margin: '2px 0 0' }}>The survey does not ask these, so they come from interviews.</p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <DonutCard title="Coverage awareness" note="how well they know their plan" data={stats.awareness} total={n} empty="No awareness recorded yet." />
            <DonutCard title="Bullseye segment" note="who we're hearing from" data={stats.bullseye} total={n} empty="No segments tagged yet." />
          </div>

          <div className="card">
            <div className="hd"><h2>Recurring themes</h2><span className="note">auto-tagged from interviews</span></div>
            <div className="bd"><Bars data={stats.themes} total={n} empty="No themes yet." /></div>
          </div>

          <div className="card">
            <div className="hd"><h2>Top benefit by segment</h2><span className="note">which benefits matter to whom</span></div>
            <div className="tablewrap">
              <table>
                <thead><tr><th>Segment</th><th>Interviews</th><th>Top benefits</th></tr></thead>
                <tbody>
                  {stats.segments.map(([seg, v]) => (
                    <tr key={seg} style={{ cursor: 'default' }}>
                      <td><span className="tag b">{seg}</span></td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{v.count}</td>
                      <td>{Object.entries(v.benefits).sort((a, b) => b[1] - a[1]).map(([b, c]) => `${b} (${c})`).join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="hd"><h2>Quote wall</h2><span className="note">{stats.quotes.length} verbatim lines</span></div>
            <div className="bd" style={{ display: 'grid', gap: 12 }}>
              {stats.quotes.length === 0 && <div className="empty">No quotes captured yet.</div>}
              {stats.quotes.map((r) => (
                <div key={r.id} style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 14 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.4 }}>&ldquo;{r.quote}&rdquo;</div>
                  <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 3 }}>{r.who ? r.who.slice(0, 80) : 'unknown'}{r.plan ? ` · ${r.plan}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  )
}
