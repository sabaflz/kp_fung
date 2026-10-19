import { Fragment, useMemo, useState } from 'react'
import { FIELDS, BULLSEYE_TAGS, STATUS_TAGS, EXTRACT_PROMPT, BENEFITS, snapBenefits, snapTopBenefit } from '../data/pool.js'
import { useInterviews, addInterview, updateInterview, deleteInterview } from '../lib/data.js'
import { useAuth } from '../lib/auth.jsx'
import { Modal, useToast, copyText } from '../components/ui.jsx'

const LONG = new Set(['benefits_want', 'friction', 'surprise', 'quote', 'workaround', 'last_use', 'services'])

// Map the AI extract prompt's labels back onto our field keys.
const LABEL_MAP = [
  [/^date/, 'interview_date'], [/^interviewer/, 'interviewer'], [/^who/, 'who'],
  [/^current plan|^plan/, 'plan'], [/^how they got|^got/, 'got_it'],
  [/^coverage awareness|^awareness/, 'awareness'], [/^last/, 'last_use'],
  [/^services/, 'services'], [/^benefits/, 'benefits_want'], [/^top benefit/, 'top_benefit'],
  [/^workaround/, 'workaround'], [/^friction|^pain/, 'friction'],
  [/^one surprise|^surprise/, 'surprise'], [/^best quote|^quote/, 'quote'],
  [/^follow/, 'followup'],
]

function todayMD() {
  const d = new Date()
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// Parse interview_date ("10/13", "10/13/2026", "2026-10-13") to a sortable time.
// Undated rows return -Infinity so they sort to the bottom.
function parseDate(s) {
  const t = (s || '').trim()
  if (!t) return -Infinity
  const p = t.split(/[/.\-]/).map((x) => parseInt(x, 10))
  if (p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1])) {
    // ISO-ish (year first) vs US (month first)
    let y, m, d
    if (p[0] > 31) { y = p[0]; m = p[1]; d = p[2] || 1 }
    else { m = p[0]; d = p[1]; y = p[2] }
    if (!Number.isFinite(y)) y = new Date().getFullYear()
    else if (y < 100) y += 2000
    return new Date(y, m - 1, d).getTime()
  }
  const ms = Date.parse(t)
  return Number.isFinite(ms) ? ms : -Infinity
}

export default function Interviews() {
  const { rows, loading } = useInterviews()
  const { session } = useAuth()
  const toast = useToast()
  const [editing, setEditing] = useState(null) // record object (new has no id)
  const [viewing, setViewing] = useState(null)

  // Newest interviews first; undated fall to the bottom.
  const sorted = useMemo(
    () => [...rows].sort((a, b) => parseDate(b.interview_date) - parseDate(a.interview_date)),
    [rows],
  )

  function startNew() {
    setEditing({
      interview_date: todayMD(),
      interviewer: (session?.user?.email || '').split('@')[0],
      bullseye: BULLSEYE_TAGS[0], status: 'logged',
    })
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow">Field notes</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
            Interviews
          </h1>
          <p className="lede">Every interview the team logs, in one shared place. Paste a transcript and pull the fields out with AI, or fill them in by hand.</p>
        </div>
        <button className="btn" onClick={startNew}>+ Log interview</button>
      </div>

      <div className="card">
        <div className="hd"><h2>All interviews</h2><span className="note">{rows.length} logged · newest first</span></div>
        {loading ? (
          <div className="empty"><span className="spin" /></div>
        ) : rows.length === 0 ? (
          <div className="empty">Nothing logged yet. Hit <b>Log interview</b> after your first conversation.</div>
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr><th>Date</th><th>Who</th><th>Plan</th><th>Top benefit</th><th>Bullseye</th><th>Status</th></tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id} onClick={() => setViewing(r)}>
                    <td style={{ whiteSpace: 'nowrap' }}>{r.interview_date || '—'}</td>
                    <td>{r.who || '—'}</td>
                    <td>{r.plan || '—'}</td>
                    <td>{r.top_benefit || '—'}</td>
                    <td>{r.bullseye ? <span className="tag b">{r.bullseye}</span> : '—'}</td>
                    <td><span className={'tag s-' + (r.status || 'logged')}>{r.status || 'logged'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <InterviewForm
          record={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); toast('Saved to the team workspace') }}
          onError={(m) => toast(m || 'Could not save')}
        />
      )}

      {viewing && (
        <DetailView
          record={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null) }}
          onDelete={async () => {
            try { await deleteInterview(viewing.id); setViewing(null); toast('Deleted') }
            catch { toast('Could not delete') }
          }}
        />
      )}
    </div>
  )
}

function InterviewForm({ record, onClose, onSaved, onError }) {
  const isEdit = Boolean(record.id)
  const [form, setForm] = useState(record)
  const [aiOut, setAiOut] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })) }

  async function copyPrompt() {
    const filled = EXTRACT_PROMPT.replace('[PASTE TRANSCRIPT HERE]', form.transcript || '[PASTE TRANSCRIPT HERE]')
    toast((await copyText(filled)) ? 'Prompt + transcript copied' : 'Copy failed')
  }

  function applyAI() {
    const patch = {}
    for (const line of (aiOut || '').split('\n')) {
      const i = line.indexOf(':')
      if (i < 0) continue
      const label = line.slice(0, i).trim().toLowerCase()
      const value = line.slice(i + 1).trim()
      if (!value || /^n\/?a$/i.test(value)) continue
      const hit = LABEL_MAP.find(([re]) => re.test(label))
      if (hit) patch[hit[1]] = value
    }
    // Snap the benefit fields onto the shared survey categories so charts line up.
    if (patch.benefits_want) { const s = snapBenefits(patch.benefits_want); if (s.length) patch.benefits_want = s.join(', ') }
    if (patch.top_benefit) patch.top_benefit = snapTopBenefit(patch.top_benefit)
    if (Object.keys(patch).length) { setForm((f) => ({ ...f, ...patch })); toast('Fields filled from AI output') }
    else toast('No fields found. Paste the "Field: value" lines.')
  }

  // benefits_want is stored as a comma-joined list of canonical categories.
  const wantSet = BENEFITS.filter((b) => (form.benefits_want || '').includes(b))
  function toggleBenefit(label) {
    const cur = new Set(wantSet)
    cur.has(label) ? cur.delete(label) : cur.add(label)
    set('benefits_want', BENEFITS.filter((b) => cur.has(b)).join(', '))
  }
  const topOptions = (form.top_benefit && !BENEFITS.includes(form.top_benefit))
    ? [form.top_benefit, ...BENEFITS] : BENEFITS

  async function save() {
    setBusy(true)
    try {
      const { id, created_at, created_by, ...payload } = form
      if (isEdit) await updateInterview(record.id, payload)
      else await addInterview(payload)
      onSaved()
    } catch (e) { onError(e.message) } finally { setBusy(false) }
  }

  return (
    <Modal onClose={onClose}>
      <div className="hd" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 2 }}>
        <h2 style={{ fontSize: 17 }}>{isEdit ? 'Edit interview' : 'Log interview'}</h2>
        <button className="theme-btn" onClick={onClose}>Close</button>
      </div>

      <div style={{ padding: 20, display: 'grid', gap: 18 }}>
        <section className="card" style={{ boxShadow: 'none' }}>
          <div className="hd"><h2 style={{ fontSize: 14 }}>Auto-fill from a transcript</h2></div>
          <div className="bd" style={{ display: 'grid', gap: 10 }}>
            <div className="field">
              <label>Transcript <span className="hint">(raw notes or a recording transcript)</span></label>
              <textarea className="inp" style={{ minHeight: 90 }} value={form.transcript || ''} onChange={(e) => set('transcript', e.target.value)} placeholder="Paste the conversation here…" />
            </div>
            <div className="row">
              <button type="button" className="btn ghost sm" onClick={copyPrompt}>1 · Copy prompt + transcript</button>
              <span className="hint" style={{ fontSize: 12, color: 'var(--faint)' }}>Paste into any AI assistant, then bring its answer back below.</span>
            </div>
            <div className="field">
              <label>2 · Paste the AI&rsquo;s &ldquo;Field: value&rdquo; answer</label>
              <textarea className="inp" style={{ minHeight: 70 }} value={aiOut} onChange={(e) => setAiOut(e.target.value)} placeholder="Date: 10/13&#10;Who: 24, working, off parent's plan soon…" />
            </div>
            <div className="row">
              <button type="button" className="btn sm" onClick={applyAI}>3 · Fill the fields below</button>
              <button type="button" className="btn ghost sm" disabled title="Add an OpenAI/Anthropic key to the project later to enable one-click extraction">One-click extract (add API key later)</button>
            </div>
          </div>
        </section>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
          {FIELDS.map(([key, label, hint]) => {
            if (key === 'benefits_want') return (
              <div className="field" key={key} style={{ gridColumn: '1 / -1' }}>
                <label>{label} <span className="hint">(pick from the survey categories)</span></label>
                <div className="row">
                  {BENEFITS.map((b) => (
                    <button type="button" key={b} className={'chip' + (wantSet.includes(b) ? ' on' : '')} onClick={() => toggleBenefit(b)}>{b}</button>
                  ))}
                </div>
              </div>
            )
            if (key === 'top_benefit') return (
              <div className="field" key={key}>
                <label htmlFor={key}>{label} <span className="hint">(the one that matters most)</span></label>
                <select id={key} className="inp" value={form.top_benefit || ''} onChange={(e) => set('top_benefit', e.target.value)}>
                  <option value="">—</option>
                  {topOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )
            return (
              <div className="field" key={key} style={LONG.has(key) ? { gridColumn: '1 / -1' } : undefined}>
                <label htmlFor={key}>{label} {hint && <span className="hint">{hint}</span>}</label>
                {LONG.has(key)
                  ? <textarea id={key} className="inp" value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />
                  : <input id={key} className="inp" value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />}
              </div>
            )
          })}
          <div className="field">
            <label htmlFor="bullseye">Bullseye segment</label>
            <select id="bullseye" className="inp" value={form.bullseye || ''} onChange={(e) => set('bullseye', e.target.value)}>
              <option value="">—</option>
              {BULLSEYE_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" className="inp" value={form.status || 'logged'} onChange={(e) => set('status', e.target.value)}>
              {STATUS_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn" onClick={save} disabled={busy}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Save interview'}</button>
        </div>
      </div>
    </Modal>
  )
}

function DetailView({ record, onClose, onEdit, onDelete }) {
  const r = record
  const pairs = [
    ...FIELDS.map(([key, label]) => [label, r[key]]),
    ['Bullseye', r.bullseye], ['Status', r.status],
  ].filter(([, v]) => v)

  return (
    <Modal onClose={onClose}>
      <div className="hd" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 2 }}>
        <div className="row" style={{ gap: 8 }}>
          <h2 style={{ fontSize: 17 }}>{r.who || 'Interview'}</h2>
          <span className={'tag s-' + (r.status || 'logged')}>{r.status || 'logged'}</span>
        </div>
        <button className="theme-btn" onClick={onClose}>Close</button>
      </div>
      <div style={{ padding: 20, display: 'grid', gap: 16 }}>
        {r.quote && (
          <blockquote style={{ margin: 0, padding: '14px 16px', borderLeft: '3px solid var(--accent)', background: 'var(--accent-soft)', borderRadius: 8, fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.4, color: 'var(--accent-ink)' }}>
            &ldquo;{r.quote}&rdquo;
          </blockquote>
        )}
        <dl className="detail">
          {pairs.map(([label, v]) => (<Fragment key={label}><dt>{label}</dt><dd>{v}</dd></Fragment>))}
        </dl>
        {r.transcript && (
          <details>
            <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Full transcript</summary>
            <div className="out" style={{ marginTop: 8 }}>{r.transcript}</div>
          </details>
        )}
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button className="btn danger sm" onClick={onDelete}>Delete</button>
          <button className="btn" onClick={onEdit}>Edit</button>
        </div>
      </div>
    </Modal>
  )
}
