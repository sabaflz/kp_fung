import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, isConfigured } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'
import { useToast } from '../components/ui.jsx'

/* Meeting notes: one entry per meeting, newest first. Team only. The database
   enforces that (supabase_meeting_notes.sql); the sidebar link is also hidden
   from invited viewers. */

const KINDS = ['KP partners', 'Team', 'Class', '1-on-1', 'Other']
const EMPTY = { meeting_date: '', title: '', kind: 'KP partners', attendees: '', summary: '', decisions: '', actions: '' }

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
// Dates are stored as plain YYYY-MM-DD. Build them as local dates so a meeting
// on the 7th never shows as the 6th in a timezone west of UTC.
const asDate = (iso) => { const [y, m, d] = (iso || '').split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1) }
const fmtDay = (iso) => asDate(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
const fmtMonth = (iso) => asDate(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

function Section({ label, text }) {
  if (!text || !text.trim()) return null
  return (
    <div className="mt-sec">
      <h4>{label}</h4>
      <p>{text}</p>
    </div>
  )
}

function MeetingForm({ initial, onSave, onCancel, busy }) {
  const [f, setF] = useState(initial)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const ok = f.meeting_date && f.title.trim()
  return (
    <form className="mt-form" onSubmit={(e) => { e.preventDefault(); if (ok) onSave(f) }}>
      <div className="mt-form-row">
        <div className="field">
          <label htmlFor="mt-date">Date</label>
          <input id="mt-date" className="inp" type="date" required value={f.meeting_date} onChange={set('meeting_date')} />
        </div>
        <div className="field">
          <label htmlFor="mt-kind">Type</label>
          <select id="mt-kind" className="inp" value={f.kind} onChange={set('kind')}>
            {KINDS.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="mt-title">Title</label>
        <input id="mt-title" className="inp" required placeholder="Weekly partner call" value={f.title} onChange={set('title')} />
      </div>
      <div className="field">
        <label htmlFor="mt-att">Who was there</label>
        <input id="mt-att" className="inp" placeholder="Sheila, Amy, Tamer, and the team" value={f.attendees || ''} onChange={set('attendees')} />
      </div>
      <div className="field">
        <label htmlFor="mt-sum">What was discussed</label>
        <textarea id="mt-sum" className="inp" rows={6} value={f.summary || ''} onChange={set('summary')} />
      </div>
      <div className="field">
        <label htmlFor="mt-dec">What was decided</label>
        <textarea id="mt-dec" className="inp" rows={3} value={f.decisions || ''} onChange={set('decisions')} />
      </div>
      <div className="field">
        <label htmlFor="mt-act">Who does what next</label>
        <textarea id="mt-act" className="inp" rows={3} value={f.actions || ''} onChange={set('actions')} />
      </div>
      <div className="mt-form-actions">
        <button className="btn" type="submit" disabled={!ok || busy}>{busy ? 'Saving…' : 'Save meeting'}</button>
        <button className="btn ghost" type="button" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  )
}

export default function Meetings() {
  const { session } = useAuth()
  const email = session?.user?.email || ''
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [state, setState] = useState('loading') // loading | ok | error | unconfigured
  const [openId, setOpenId] = useState(null)
  const [editing, setEditing] = useState(null) // null | 'new' | id
  const [confirmDel, setConfirmDel] = useState(null)
  const [busy, setBusy] = useState(false)
  const [kind, setKind] = useState('All')
  const [q, setQ] = useState('')

  const refresh = useCallback(async () => {
    if (!isConfigured) { setState('unconfigured'); return }
    const { data, error } = await supabase.from('meeting_notes').select('*')
      .order('meeting_date', { ascending: false }).order('created_at', { ascending: false })
    if (error) { setState('error'); return }
    setRows(data || [])
    setState('ok')
  }, [])
  useEffect(() => { refresh() }, [refresh])

  async function save(f) {
    setBusy(true)
    const payload = {
      meeting_date: f.meeting_date, title: f.title.trim(), kind: f.kind,
      attendees: (f.attendees || '').trim() || null, summary: (f.summary || '').trim() || null,
      decisions: (f.decisions || '').trim() || null, actions: (f.actions || '').trim() || null,
      updated_by: email, updated_at: new Date().toISOString(),
    }
    const res = editing === 'new'
      ? await supabase.from('meeting_notes').insert(payload).select().single()
      : await supabase.from('meeting_notes').update(payload).eq('id', editing).select().single()
    setBusy(false)
    if (res.error) { toast('Could not save: ' + res.error.message); return }
    setEditing(null)
    setOpenId(res.data?.id || null)
    toast('Meeting saved')
    refresh()
  }

  async function remove(id) {
    setBusy(true)
    const { error } = await supabase.from('meeting_notes').delete().eq('id', id)
    setBusy(false)
    setConfirmDel(null)
    if (error) { toast('Could not delete: ' + error.message); return }
    toast('Meeting deleted')
    refresh()
  }

  const today = todayISO()
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (kind !== 'All' && r.kind !== kind) return false
      if (!needle) return true
      return [r.title, r.attendees, r.summary, r.decisions, r.actions].some((t) => (t || '').toLowerCase().includes(needle))
    })
  }, [rows, kind, q])

  const upcoming = shown.filter((r) => r.meeting_date > today).reverse() // soonest first
  const past = shown.filter((r) => r.meeting_date <= today)
  const months = []
  for (const r of past) {
    const m = fmtMonth(r.meeting_date)
    if (!months.length || months[months.length - 1][0] !== m) months.push([m, []])
    months[months.length - 1][1].push(r)
  }
  const kindsInUse = ['All', ...KINDS.filter((k) => rows.some((r) => r.kind === k))]

  const renderRow = (r) => {
    const open = openId === r.id
    if (editing === r.id) {
      return (
        <li key={r.id} className="mt-item is-open">
          <MeetingForm initial={{ ...EMPTY, ...r }} onSave={save} onCancel={() => setEditing(null)} busy={busy} />
        </li>
      )
    }
    const empty = !r.summary && !r.decisions && !r.actions
    return (
      <li key={r.id} className={'mt-item' + (open ? ' is-open' : '')}>
        <button type="button" className="mt-row" aria-expanded={open} onClick={() => setOpenId(open ? null : r.id)}>
          <span className="mt-date">{fmtDay(r.meeting_date)}</span>
          <span className="mt-title">{r.title}</span>
          <span className="mt-kind">{r.kind}</span>
          <span className="mt-caret" aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
        {open && (
          <div className="mt-body">
            {r.attendees && <p className="mt-att"><b>Who was there:</b> {r.attendees}</p>}
            <Section label="What was discussed" text={r.summary} />
            <Section label="What was decided" text={r.decisions} />
            <Section label="Who does what next" text={r.actions} />
            {empty && <p className="mt-none">No notes written yet.</p>}
            <div className="mt-row-actions">
              <button type="button" className="btn ghost sm" onClick={() => { setEditing(r.id); setConfirmDel(null) }}>Edit</button>
              {confirmDel === r.id ? (
                <>
                  <span className="mt-confirm">Delete this meeting for everyone?</span>
                  <button type="button" className="btn sm mt-danger" disabled={busy} onClick={() => remove(r.id)}>Yes, delete</button>
                  <button type="button" className="btn ghost sm" onClick={() => setConfirmDel(null)}>Keep it</button>
                </>
              ) : (
                <button type="button" className="btn ghost sm" onClick={() => setConfirmDel(r.id)}>Delete</button>
              )}
              {r.updated_by && <span className="mt-by">Last edited by {r.updated_by}</span>}
            </div>
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="mt">
      <div className="bets-intro">
        <div>
          <div className="eyebrow">Record</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
            Meeting notes
          </h1>
          <p className="lede" style={{ margin: 0 }}>
            Every meeting in one place: what was said, what was decided, and who owes what. Only the team can see this page.
          </p>
        </div>
        {state === 'ok' && editing !== 'new' && (
          <button type="button" className="btn sm" onClick={() => { setEditing('new'); setOpenId(null) }}>+ New meeting</button>
        )}
      </div>

      {state === 'unconfigured' && <div className="notice">Connect Supabase to keep meeting notes.</div>}
      {state === 'error' && (
        <div className="notice">
          Could not load meeting notes. If this is the first time, run <code>supabase_meeting_notes.sql</code> in the Supabase SQL editor.
        </div>
      )}
      {state === 'loading' && <div className="center" style={{ minHeight: 120 }}><span className="spin" /></div>}

      {editing === 'new' && (
        <div className="mt-item is-open">
          <MeetingForm initial={{ ...EMPTY, meeting_date: today }} onSave={save} onCancel={() => setEditing(null)} busy={busy} />
        </div>
      )}

      {state === 'ok' && rows.length > 0 && (
        <div className="mt-filters">
          <div className="b2-seg" role="group" aria-label="Filter by type">
            {kindsInUse.map((k) => (
              <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>
            ))}
          </div>
          <input className="inp mt-search" type="search" placeholder="Search notes" aria-label="Search notes"
            value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      )}

      {state === 'ok' && rows.length === 0 && editing !== 'new' && (
        <div className="notice">No meetings yet. Add the first one with “New meeting”.</div>
      )}
      {state === 'ok' && rows.length > 0 && shown.length === 0 && (
        <div className="notice">Nothing matches that filter.</div>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="mt-month">Coming up</h2>
          <ul className="mt-list">{upcoming.map(renderRow)}</ul>
        </section>
      )}
      {months.map(([m, list]) => (
        <section key={m}>
          <h2 className="mt-month">{m}</h2>
          <ul className="mt-list">{list.map(renderRow)}</ul>
        </section>
      ))}
    </div>
  )
}
