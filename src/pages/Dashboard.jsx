import { useMemo } from 'react'
import { FIELDS } from '../data/pool.js'
import { useInterviews, useSettings, useShares } from '../lib/data.js'
import { useSurvey } from '../lib/survey.js'
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

function Bars({ data, empty, total }) {
  if (!data.length) return <div className="empty">{empty}</div>
  const max = data[0][1]
  return (
    <div className="bars">
      {data.map(([label, n]) => (
        <div className="bar" key={label}>
          <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{label}</span>
          <div className="track"><div className="fill" style={{ width: Math.max(6, (n / max) * 100) + '%' }} /></div>
          <span className="v">{total ? `${n} · ${Math.round((n / total) * 100)}%` : n}</span>
        </div>
      ))}
    </div>
  )
}

// Categorical slice colors that read in both light and dark.
const SLICE = ['#14b8a6', '#f59e0b', '#6366f1', '#f43f5e', '#94a3b8', '#22c55e']

function Donut({ data, total, size = 148 }) {
  const r = 56, sw = 22, C = 2 * Math.PI * r, cx = size / 2, cy = size / 2
  const tot = total || data.reduce((s, [, nn]) => s + nn, 0) || 1
  let off = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="donut chart" style={{ flex: 'none' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={sw} />
      {data.map(([label, nn], i) => {
        const f = nn / tot
        const el = (
          <circle key={label} cx={cx} cy={cy} r={r} fill="none" stroke={SLICE[i % SLICE.length]} strokeWidth={sw}
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

function Legend({ data, total }) {
  const tot = total || data.reduce((s, [, n]) => s + n, 0) || 1
  return (
    <div style={{ display: 'grid', gap: 9, minWidth: 0, flex: 1 }}>
      {data.map(([label, n], i) => (
        <div key={label} className="row" style={{ justifyContent: 'space-between', gap: 10, flexWrap: 'nowrap' }}>
          <span className="row" style={{ gap: 8, minWidth: 0, flexWrap: 'nowrap' }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: SLICE[i % SLICE.length], flex: 'none' }} />
            <span style={{ overflowWrap: 'anywhere', fontSize: 13 }}>{label}</span>
          </span>
          <span style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', fontSize: 12.5 }}>{n} &middot; {Math.round((n / tot) * 100)}%</span>
        </div>
      ))}
    </div>
  )
}

function DonutCard({ title, note, data, total, empty }) {
  return (
    <div className="card">
      <div className="hd"><h2>{title}</h2>{note && <span className="note">{note}</span>}</div>
      <div className="bd">
        {data.length === 0 ? <div className="empty">{empty}</div> : (
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <Donut data={data} total={total} />
            <Legend data={data} total={total} />
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
  const { rows: shares } = useShares()
  const toast = useToast()

  const placesShared = shares.filter((r) => r.status === 'posted').length
  const n = rows.length

  const combined = useMemo(() => {
    const m = { ...(survey.topMap || {}) }
    for (const r of rows) { const c = (r.top_benefit || '').trim(); if (c) m[c] = (m[c] || 0) + 1 }
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [survey.topMap, rows])

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
        <div className="tile"><div className="n">{placesShared}</div><div className="l">places shared</div></div>
        <div className="tile"><div className="n">{n ? Math.round((stats.lowPartial / n) * 100) + '%' : '—'}</div><div className="l">low/partial awareness</div></div>
        <div className="tile"><div className="n">{stats.quotes.length}</div><div className="l">quotes captured</div></div>
      </div>

      {(combined.length > 0) && (
        <div className="card">
          <div className="hd"><h2>Top benefit, survey + interviews</h2><span className="note">same ten categories</span></div>
          <div className="bd"><Bars data={combined} empty="Connect the survey or log interviews to see this." /></div>
        </div>
      )}

      {n === 0 ? (
        <div className="card"><div className="empty">No data yet. The charts fill in as interviews are logged.</div></div>
      ) : (
        <>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <DonutCard title="Coverage awareness" note="how well they know their plan" data={stats.awareness} total={n} empty="No awareness recorded yet." />
            <DonutCard title="Bullseye segment" note="who we're hearing from" data={stats.bullseye} total={n} empty="No segments tagged yet." />
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div className="card">
              <div className="hd"><h2>Top benefit named</h2><span className="note">the one that matters most</span></div>
              <div className="bd"><Bars data={stats.topBenefit} total={n} empty="No top benefit recorded yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Benefits wanted</h2><span className="note">share of interviews</span></div>
              <div className="bd"><Bars data={stats.wants.slice(0, 10)} total={n} empty="Nothing recorded yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Recurring themes</h2><span className="note">auto-tagged from interviews</span></div>
              <div className="bd"><Bars data={stats.themes} total={n} empty="No themes yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Current plans</h2></div>
              <div className="bd"><Bars data={stats.plans} total={n} empty="No plans recorded yet." /></div>
            </div>
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
