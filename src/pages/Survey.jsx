import { useEffect, useMemo, useState } from 'react'
import { useSettings, setSetting, useInterviews } from '../lib/data.js'
import { snapBenefits } from '../data/pool.js'
import { useToast } from '../components/ui.jsx'

/* Turn any Google Sheets URL into a CSV endpoint the browser can fetch. */
function csvEndpoint(url) {
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

function Bars({ data, empty, limit = 12 }) {
  if (!data.length) return <div className="empty">{empty}</div>
  const max = data[0][1]
  return (
    <div className="bars">
      {data.slice(0, limit).map(([label, n]) => (
        <div className="bar" key={label}>
          <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{label}</span>
          <div className="track"><div className="fill" style={{ width: Math.max(6, (n / max) * 100) + '%' }} /></div>
          <span className="v">{n}</span>
        </div>
      ))}
    </div>
  )
}

export default function Survey() {
  const { map } = useSettings()
  const { rows: interviews } = useInterviews()
  const toast = useToast()

  const [formUrl, setFormUrl] = useState('')
  const [sheetUrl, setSheetUrl] = useState('')
  const [csvUrl, setCsvUrl] = useState('')
  const [raw, setRaw] = useState(null)
  const [state, setState] = useState('idle') // idle | loading | ok | error
  const [err, setErr] = useState('')

  useEffect(() => {
    setFormUrl(map.form_url || ''); setSheetUrl(map.sheet_url || ''); setCsvUrl(map.survey_csv_url || '')
  }, [map.form_url, map.sheet_url, map.survey_csv_url])

  useEffect(() => {
    const url = map.survey_csv_url
    if (!url) { setRaw(null); setState('idle'); return }
    let cancelled = false
    setState('loading'); setErr('')
    fetch(csvEndpoint(url))
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text() })
      .then((text) => {
        if (cancelled) return
        const rows = parseCSV(text)
        setRaw({ header: rows[0] || [], rows: rows.slice(1).filter((r) => r.some((c) => c && c.trim())) })
        setState('ok')
      })
      .catch((e) => { if (cancelled) return; setErr(e.message || 'fetch failed'); setState('error') })
    return () => { cancelled = true }
  }, [map.survey_csv_url])

  async function saveLinks() {
    try {
      await Promise.all([
        setSetting('form_url', formUrl.trim()),
        setSetting('sheet_url', sheetUrl.trim()),
        setSetting('survey_csv_url', csvUrl.trim()),
      ])
      toast('Saved for the team')
    } catch (e) { toast(e.message || 'Could not save') }
  }

  const a = useMemo(() => {
    const H = (raw?.header || []).map((h) => (h || '').toLowerCase())
    const find = (kw) => H.findIndex((h) => kw.some((k) => h.includes(k)))
    const col = {
      age: find(['age']),
      want: find(['would you most want', 'which three', 'most want']),
      top: find(['number one priority', 'your number one', 'which is your']),
      use: find(['no additional cost', 'likely would you be to use']),
      five: find(['more per month', '5 more', 'costs 5']),
    }
    const vals = (i) => (i < 0 || !raw) ? [] : raw.rows.map((r) => (r[i] || '').trim()).filter(Boolean)
    const tally = (arr) => { const m = {}; for (const v of arr) m[v] = (m[v] || 0) + 1; return Object.entries(m).sort((x, y) => y[1] - x[1]) }

    const surveyTop = {}
    for (const v of vals(col.top)) { const c = snapBenefits(v)[0]; if (c) surveyTop[c] = (surveyTop[c] || 0) + 1 }
    const surveyWant = {}
    for (const v of vals(col.want)) for (const c of snapBenefits(v)) surveyWant[c] = (surveyWant[c] || 0) + 1

    const combined = {}
    for (const [k, v] of Object.entries(surveyTop)) combined[k] = (combined[k] || 0) + v
    for (const r of interviews) { const c = (r.top_benefit || '').trim(); if (c) combined[c] = (combined[c] || 0) + 1 }

    return {
      responses: raw ? raw.rows.length : 0,
      age: tally(vals(col.age)),
      use: tally(vals(col.use)),
      five: tally(vals(col.five)),
      surveyWant: Object.entries(surveyWant).sort((x, y) => y[1] - x[1]),
      surveyTop: Object.entries(surveyTop).sort((x, y) => y[1] - x[1]),
      combined: Object.entries(combined).sort((x, y) => y[1] - x[1]),
    }
  }, [raw, interviews])

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div>
        <div className="eyebrow">Survey</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
          Survey responses
        </h1>
        <p className="lede">The form, the sheet, and the responses, pulled in live and lined up with the interviews on the same benefit categories.</p>
      </div>

      <div className="card">
        <div className="hd"><h2>Links &amp; sync</h2>
          {state === 'ok' && <span className="note">{a.responses} responses pulled in</span>}
          {state === 'loading' && <span className="note">loading…</span>}
        </div>
        <div className="bd" style={{ display: 'grid', gap: 12 }}>
          <div className="field">
            <label htmlFor="f1">Google Form link <span className="hint">(the one you send people)</span></label>
            <input id="f1" className="inp" value={formUrl} placeholder="https://docs.google.com/forms/…" onChange={(e) => setFormUrl(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f2">Google Sheet link <span className="hint">(the responses sheet)</span></label>
            <input id="f2" className="inp" value={sheetUrl} placeholder="https://docs.google.com/spreadsheets/…" onChange={(e) => setSheetUrl(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f3">Published CSV link <span className="hint">(Sheet &rarr; File &rarr; Share &rarr; Publish to web &rarr; CSV)</span></label>
            <input id="f3" className="inp" value={csvUrl} placeholder="https://docs.google.com/spreadsheets/d/e/…/pub?output=csv" onChange={(e) => setCsvUrl(e.target.value)} />
          </div>
          <div className="row">
            <button className="btn" onClick={saveLinks}>Save for the team</button>
            {formUrl && <a className="btn ghost sm" href={formUrl} target="_blank" rel="noreferrer">Open form</a>}
            {sheetUrl && <a className="btn ghost sm" href={sheetUrl} target="_blank" rel="noreferrer">Open sheet</a>}
          </div>
          {state === 'error' && (
            <div className="notice" style={{ background: 'transparent', borderColor: 'var(--bad)', color: 'var(--bad)' }}>
              Could not read the sheet ({err}). Make sure you used <b>Publish to web &rarr; CSV</b> and pasted that link, or that the sheet is shared so anyone with the link can view.
            </div>
          )}
          {state === 'idle' && (
            <div className="notice">
              No responses connected yet. In the responses Google Sheet, go to <b>File, then Share, then Publish to web</b>, choose <b>CSV</b>, copy that link into the box above, and Save. The charts fill in automatically and update as responses come in.
            </div>
          )}
        </div>
      </div>

      <div className="tiles">
        <div className="tile"><div className="n">{a.responses}</div><div className="l">survey responses</div></div>
        <div className="tile"><div className="n">{interviews.length}</div><div className="l">interviews logged</div></div>
      </div>

      <div className="card">
        <div className="hd"><h2>Top benefit, survey + interviews</h2><span className="note">same ten categories</span></div>
        <div className="bd"><Bars data={a.combined} empty="Connect the survey or log interviews to see this." /></div>
      </div>

      {state === 'ok' && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
          <div className="card">
            <div className="hd"><h2>Benefits wanted (survey)</h2><span className="note">all mentions</span></div>
            <div className="bd"><Bars data={a.surveyWant} empty="No responses yet." /></div>
          </div>
          <div className="card">
            <div className="hd"><h2>Age</h2></div>
            <div className="bd"><Bars data={a.age} empty="No responses yet." /></div>
          </div>
          <div className="card">
            <div className="hd"><h2>Would use if free</h2></div>
            <div className="bd"><Bars data={a.use} empty="No responses yet." /></div>
          </div>
          <div className="card">
            <div className="hd"><h2>Still choose it at $5 more</h2></div>
            <div className="bd"><Bars data={a.five} empty="No responses yet." /></div>
          </div>
        </div>
      )}
    </div>
  )
}
