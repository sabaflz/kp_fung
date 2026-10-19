import { useState } from 'react'
import { FIELDS } from '../data/pool.js'
import { useInterviews, useSettings } from '../lib/data.js'
import { useSurvey } from '../lib/survey.js'
import { coverageBucket, situationBucket, choiceBucket } from '../data/buckets.js'
import { useToast, copyText } from '../components/ui.jsx'
import { tally, splitMany, combineTriples, SplitBars } from '../components/charts.jsx'

function GroupLabel({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>{children}</div>
}

export default function Dashboard() {
  const { rows, loading } = useInterviews()
  const { map } = useSettings()
  const survey = useSurvey(map.survey_csv_url)
  const toast = useToast()
  const [source, setSource] = useState('both') // both | interviews | survey

  const n = rows.length
  const totalResponses = n + survey.responses

  // Rankings (stacked bars).
  const iWant = {}
  for (const r of rows) for (const c of splitMany(r.benefits_want)) iWant[c] = (iWant[c] || 0) + 1
  const wantTri = combineTriples(Object.entries(iWant), survey.want || []).slice(0, 10)
  const topTri = combineTriples(tally(rows.map((r) => r.top_benefit)), survey.top || [])

  // Stacked-bar dimensions (each shows interviews + survey together).
  const inflTri = combineTriples(tally(rows.map((r) => r.influence)), survey.influence || [])
  const flexTri = combineTriples(tally(rows.map((r) => r.flex_pref)), survey.flex || [])
  const covTri = combineTriples(tally(rows.map((r) => coverageBucket(r.plan))), survey.coverage || [])
  const sitTri = combineTriples(tally(rows.map((r) => situationBucket(r.who))), survey.situation || [])

  // Pick-the-plan is near-unanimous, so it is a headline number, not a chart.
  const choTri = combineTriples(tally(rows.map((r) => choiceBucket(r.plan_choice))), survey.choose || [])
  const pickN = (i, s) => source === 'interviews' ? i : source === 'survey' ? s : i + s

  // Headline stat: share who would pick the plan with their benefit.
  const withRow = choTri.find(([l]) => l === 'With the benefit')
  const withVal = withRow ? pickN(withRow[1], withRow[2]) : 0
  const choDenom = choTri.reduce((a, [, i, s]) => a + pickN(i, s), 0)
  const pickPct = choDenom ? Math.round((withVal / choDenom) * 100) : null

  // Quote wall: interview quotes (live) + any survey open-text answers (on reload).
  const quotes = [
    ...rows.filter((r) => r.quote).map((r) => ({
      key: 'i' + r.id, quote: r.quote,
      who: r.who ? r.who.slice(0, 80) : 'interview', meta: r.plan || '', source: 'interview',
    })),
    ...(survey.quotes || []).map((q, i) => ({
      key: 's' + i, quote: q, who: 'survey respondent', meta: '', source: 'survey',
    })),
  ]

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

  const headline = totalResponses
    ? `Based on ${n} interview${n === 1 ? '' : 's'} and ${survey.responses} survey response${survey.responses === 1 ? '' : 's'}.`
      + (pickPct !== null ? ` ${pickPct}% would pick the plan that includes their benefit.` : '')
    : ''

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow">Synthesis</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
            Dashboard
          </h1>
          <p className="lede">The few things the research is telling us, across everyone we have heard from. {headline}</p>
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
        <div className="tile"><div className="n">{pickPct !== null ? pickPct + '%' : '—'}</div><div className="l">would pick the plan with their benefit</div></div>
      </div>

      {totalResponses > 0 && (
        <>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="eyebrow">Across everyone</div>
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

          <GroupLabel>What people want</GroupLabel>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div className="card">
              <div className="hd"><h2>Benefits wanted</h2><span className="note">most asked for</span></div>
              <div className="bd"><SplitBars data={wantTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Top benefit</h2><span className="note">their number one</span></div>
              <div className="bd"><SplitBars data={topTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
          </div>

          <GroupLabel>What would move them</GroupLabel>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div className="card">
              <div className="hd"><h2>Do benefits sway plan choice</h2><span className="note">how much it weighs</span></div>
              <div className="bd"><SplitBars data={inflTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>If the plan had $300 to spend</h2><span className="note">set benefit vs. flexible allowance</span></div>
              <div className="bd"><SplitBars data={flexTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
          </div>

          <GroupLabel>Who we heard from</GroupLabel>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div className="card">
              <div className="hd"><h2>How they are covered</h2><span className="note">share of each source</span></div>
              <div className="bd"><SplitBars data={covTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Student or working</h2><span className="note">share of each source</span></div>
              <div className="bd"><SplitBars data={sitTri} source={source} iTotal={n} sTotal={survey.responses} empty="Nothing recorded yet." /></div>
            </div>
          </div>
        </>
      )}

      {totalResponses === 0 && (
        <div className="card"><div className="empty">No data yet. The charts fill in as interviews and survey responses come in.</div></div>
      )}

      <div className="card">
        <div className="hd"><h2>Quote wall</h2><span className="note">{quotes.length} in their own words</span></div>
        <div className="bd" style={{ display: 'grid', gap: 12 }}>
          {quotes.length === 0 && <div className="empty">No quotes yet.</div>}
          {quotes.map((q) => (
            <div key={q.key} style={{ borderLeft: `3px solid ${q.source === 'survey' ? 'var(--sv)' : 'var(--iv)'}`, paddingLeft: 14 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.4 }}>&ldquo;{q.quote}&rdquo;</div>
              <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 3 }}>
                {q.who}{q.meta ? ` · ${q.meta}` : ''} · {q.source}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
