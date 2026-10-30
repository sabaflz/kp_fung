import { useEffect, useState } from 'react'
import { useSettings, setSetting, useInterviews } from '../lib/data.js'
import { useSurvey, WHY_OPTS } from '../lib/survey.js'
import { useAuth } from '../lib/auth.jsx'
import { isViewer } from '../lib/team.js'
import { useToast } from '../components/ui.jsx'
import { combineTriples, SplitBars, tally } from '../components/charts.jsx'
import Outreach from './Outreach.jsx'

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
  const s = useSurvey(map.survey_csv_url)
  const { session } = useAuth()
  const readOnly = isViewer(session?.user?.email || '')
  const toast = useToast()

  const [formUrl, setFormUrl] = useState('')
  const [sheetUrl, setSheetUrl] = useState('')
  const [csvUrl, setCsvUrl] = useState('')

  useEffect(() => {
    setFormUrl(map.form_url || ''); setSheetUrl(map.sheet_url || ''); setCsvUrl(map.survey_csv_url || '')
  }, [map.form_url, map.sheet_url, map.survey_csv_url])

  // Why / barrier, combined with interviews (blue) on top of the survey (orange).
  const whyBucket = (texts) => {
    const m = {}
    for (const v of texts) { const t = (v || '').toLowerCase(); for (const [kw, l] of WHY_OPTS) if (t.includes(kw)) m[l] = (m[l] || 0) + 1 }
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }
  const whyTri = combineTriples(whyBucket(interviews.map((r) => r.why_top)), s.why || [])
  const barrTri = combineTriples(tally(interviews.map((r) => r.barrier)), s.barrier || [])

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

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div>
        <div className="eyebrow">Survey</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
          Survey responses
        </h1>
        <p className="lede">The form, the sheet, and the responses, pulled in live and lined up with the interviews on the same benefit categories.</p>
      </div>

      {!readOnly && (
      <div className="card">
        <div className="hd"><h2>Links &amp; sync</h2>
          {s.state === 'ok' && <span className="note">{s.responses} responses pulled in</span>}
          {s.state === 'loading' && <span className="note">loading…</span>}
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
          {s.state === 'error' && (
            <div className="notice" style={{ background: 'transparent', borderColor: 'var(--bad)', color: 'var(--bad)' }}>
              Could not read the sheet ({s.err}). Make sure you used <b>Publish to web &rarr; CSV</b> and pasted that link, or that the sheet is shared so anyone with the link can view.
            </div>
          )}
          {s.state === 'idle' && (
            <div className="notice">
              No responses connected yet. In the responses Google Sheet, go to <b>File, then Share, then Publish to web</b>, choose <b>CSV</b>, copy that link into the box above, and Save. The charts fill in automatically and update as responses come in.
            </div>
          )}
        </div>
      </div>
      )}

      <div className="tiles">
        <div className="tile"><div className="n">{s.responses}</div><div className="l">survey responses</div></div>
        <div className="tile"><div className="n">{interviews.length}</div><div className="l">interviews logged</div></div>
      </div>

      {s.state === 'ok' && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
          <div className="card">
            <div className="hd"><h2>Benefits wanted (survey)</h2><span className="note">all mentions</span></div>
            <div className="bd"><Bars data={s.want} empty="No responses yet." /></div>
          </div>
          <div className="card">
            <div className="hd"><h2>Age</h2></div>
            <div className="bd"><Bars data={s.age} empty="No responses yet." /></div>
          </div>
          <div className="card">
            <div className="hd"><h2>Would use if free</h2></div>
            <div className="bd"><Bars data={s.use} empty="No responses yet." /></div>
          </div>
          <div className="card">
            <div className="hd"><h2>Would pick the plan with the benefit</h2><span className="note">same cost</span></div>
            <div className="bd"><Bars data={s.choose} empty="No responses yet." /></div>
          </div>
        </div>
      )}

      {s.state === 'ok' && (
        <>
          <div style={{ marginTop: 6 }}>
            <div className="eyebrow">Choice and reasons</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 20, margin: '4px 0 2px' }}>Why, and what stops them</h2>
            <p className="lede">Survey and interviews combined. Teal is interviews, orange is survey.</p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div className="card">
              <div className="hd"><h2>Why it&rsquo;s their top choice</h2><span className="note">pick several</span></div>
              <div className="bd"><SplitBars data={whyTri} source="both" iTotal={interviews.length} sTotal={s.responses} empty="No responses yet." /></div>
            </div>
            <div className="card">
              <div className="hd"><h2>Reason they might not use it</h2><span className="note">even if it were free</span></div>
              <div className="bd"><SplitBars data={barrTri} source="both" iTotal={interviews.length} sTotal={s.responses} empty="No responses yet." /></div>
            </div>
          </div>
        </>
      )}

      <div style={{ marginTop: 6 }}>
        <div className="eyebrow">Distribution</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 20, margin: '4px 0 2px' }}>Where we shared it</h2>
        <p className="lede">A running log so we do not double-post and can show the partners our reach. Add a row each time anyone sends the survey somewhere.</p>
      </div>
      <Outreach />
    </div>
  )
}
