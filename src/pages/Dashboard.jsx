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

function Bars({ data, empty }) {
  if (!data.length) return <div className="empty">{empty}</div>
  const max = data[0][1]
  return (
    <div className="bars">
      {data.map(([label, n]) => (
        <div className="bar" key={label}>
          <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{label}</span>
          <div className="track"><div className="fill" style={{ width: Math.max(6, (n / max) * 100) + '%' }} /></div>
          <span className="v">{n}</span>
        </div>
      ))}
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
    return { topBenefit, wants, plans, bullseye, needs, done, quotes }
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

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow">Synthesis</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
            Dashboard
          </h1>
          <p className="lede">What the interviews are telling us, updated live as the team logs. Export anytime for the deck or a shared sheet.</p>
        </div>
        <div className="row">
          <button className="btn ghost sm" onClick={copySheet} disabled={!rows.length}>Copy for Google Sheet</button>
          <button className="btn sm" onClick={downloadCSV} disabled={!rows.length}>Download CSV</button>
        </div>
      </div>

      <div className="tiles">
        <div className="tile"><div className="n">{rows.length}</div><div className="l">interviews logged</div></div>
        <div className="tile"><div className="n">{survey.responses}</div><div className="l">survey responses</div></div>
        <div className="tile"><div className="n">{placesShared}</div><div className="l">places shared</div></div>
        <div className="tile"><div className="n">{stats.needs}</div><div className="l">need follow-up</div></div>
        <div className="tile"><div className="n">{stats.done}</div><div className="l">marked done</div></div>
        <div className="tile"><div className="n">{stats.quotes.length}</div><div className="l">quotes captured</div></div>
      </div>

      {(combined.length > 0) && (
        <div className="card">
          <div className="hd"><h2>Top benefit, survey + interviews</h2><span className="note">same ten categories</span></div>
          <div className="bd"><Bars data={combined} empty="Connect the survey or log interviews to see this." /></div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="card"><div className="empty">No data yet. The charts fill in as interviews are logged.</div></div>
      ) : (
        <>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div className="card">
              <div className="hd"><h2>Top benefit named</h2><span className="note">the one that matters most</span></div>
              <div className="bd"><Bars data={stats.topBenefit} empty="No top benefit recorded yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Benefits wanted</h2><span className="note">all mentions</span></div>
              <div className="bd"><Bars data={stats.wants.slice(0, 10)} empty="Nothing recorded yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Bullseye segment</h2></div>
              <div className="bd"><Bars data={stats.bullseye} empty="No segments tagged yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Current plans</h2></div>
              <div className="bd"><Bars data={stats.plans} empty="No plans recorded yet." /></div>
            </div>
          </div>

          <div className="card">
            <div className="hd"><h2>Quote wall</h2><span className="note">{stats.quotes.length} verbatim lines</span></div>
            <div className="bd" style={{ display: 'grid', gap: 12 }}>
              {stats.quotes.length === 0 && <div className="empty">No quotes captured yet.</div>}
              {stats.quotes.map((r) => (
                <div key={r.id} style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 14 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.4 }}>&ldquo;{r.quote}&rdquo;</div>
                  <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 3 }}>{r.who || 'unknown'}{r.plan ? ` · ${r.plan}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
