import { useMemo, useState } from 'react'
import { POOL, BUILTIN_SETS, BY_ID } from '../data/pool.js'
import { useSets, addSet, deleteSet } from '../lib/data.js'
import { useToast } from '../components/ui.jsx'

export default function Sets() {
  const { rows: saved, loading } = useSets()
  const toast = useToast()

  const [sel, setSel] = useState({})
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const groups = useMemo(() => {
    const g = {}
    for (const q of POOL) (g[q[1]] ||= []).push(q)
    return g
  }, [])

  const chosen = POOL.filter((q) => sel[q[0]]).map((q) => q[0])

  function toggle(id) { setSel((s) => ({ ...s, [id]: !s[id] })) }
  function clear() { setSel({}); setName(''); setNote('') }

  function loadInto(s) {
    const m = {}
    ;(s.question_ids || []).forEach((id) => { m[id] = true })
    setSel(m)
    setName(s.builtin ? '' : s.name)
    setNote(s.note || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save() {
    if (!name.trim() || !chosen.length) return
    setBusy(true)
    try { await addSet(name.trim(), chosen, note.trim()); toast('Set saved for the team'); clear() }
    catch (e) { toast(e.message || 'Could not save') }
    finally { setBusy(false) }
  }

  async function remove(id) {
    try { await deleteSet(id); toast('Set deleted') }
    catch { toast('Could not delete') }
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div>
        <div className="eyebrow">Question library</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
          Question sets
        </h1>
        <p className="lede">Twenty-five vetted questions. Pick the ones you want, name the set, and save it. Everything you save is shared live with the whole team.</p>
      </div>

      <div className="card">
        <div className="hd">
          <h2>Build a set</h2>
          <span className="note">{chosen.length} selected</span>
        </div>
        <div className="bd" style={{ display: 'grid', gap: 12 }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label htmlFor="sname">Set name</label>
              <input id="sname" className="inp" value={name} placeholder="e.g. Aging-off, second round" onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="snote">Note <span className="hint">(when to use it)</span></label>
              <input id="snote" className="inp" value={note} placeholder="one line of guidance" onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <div className="row">
            <button className="btn" onClick={save} disabled={busy || !name.trim() || !chosen.length}>
              {busy ? 'Saving…' : 'Save set for the team'}
            </button>
            <button className="btn ghost" onClick={clear} disabled={busy}>Clear</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="hd"><h2>Pick questions</h2><span className="note">{POOL.length} in the pool</span></div>
        <div className="bd">
          {Object.entries(groups).map(([grp, qs]) => (
            <div className="poolgrp" key={grp}>
              <h3>{grp}</h3>
              <div className="grid" style={{ gap: 8 }}>
                {qs.map((q) => (
                  <label key={q[0]} className={'qpick' + (sel[q[0]] ? ' on' : '')}>
                    <input type="checkbox" checked={!!sel[q[0]]} onChange={() => toggle(q[0])} />
                    <span>
                      <span className="id">{q[0]}</span> &nbsp;{q[2]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="hd"><h2>Saved &amp; starter sets</h2><span className="note">{saved.length} saved by the team</span></div>
        <div className="bd" style={{ display: 'grid', gap: 10 }}>
          {BUILTIN_SETS.map((s) => (
            <SetRow key={s.id} s={s} builtin onLoad={() => loadInto(s)} />
          ))}
          {loading && <div className="empty"><span className="spin" /></div>}
          {!loading && saved.length === 0 && <div className="empty">No custom sets yet. Build one above and it shows up here for everyone.</div>}
          {saved.map((s) => (
            <SetRow key={s.id} s={s} onLoad={() => loadInto(s)} onDelete={() => remove(s.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SetRow({ s, builtin, onLoad, onDelete }) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '13px 15px', display: 'grid', gap: 7 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: 8 }}>
          <strong style={{ fontSize: 14.5 }}>{s.name}</strong>
          {builtin
            ? <span className="tag b">starter</span>
            : <span className="tag s-done">{(s.question_ids || []).length} questions</span>}
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn ghost sm" onClick={onLoad}>Load &amp; edit</button>
          {!builtin && <button className="btn danger sm" onClick={onDelete}>Delete</button>}
        </div>
      </div>
      {s.note && <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{s.note}</div>}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>
        {(s.question_ids || []).join(' · ')}
      </div>
    </div>
  )
}
