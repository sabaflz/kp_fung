import { useMemo, useState } from 'react'
import { BUILTIN_SETS } from '../data/pool.js'
import {
  useSets, addSet, deleteSet,
  useQuestions, addQuestion, updateQuestion, deleteQuestion,
  useSettings, setSetting,
} from '../lib/data.js'
import { Modal, useToast } from '../components/ui.jsx'

export default function Sets() {
  const { rows: saved, loading } = useSets()
  const { rows: pool } = useQuestions()
  const { map } = useSettings()
  const toast = useToast()

  const defaultId = map.default_set || ''
  const [tab, setTab] = useState('sets') // sets | build
  const [sel, setSel] = useState({})
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [qEdit, setQEdit] = useState(null) // null | {id?, grp, body}

  const groups = useMemo(() => {
    const g = {}
    for (const q of pool) (g[q[1]] ||= []).push(q)
    return g
  }, [pool])
  const groupNames = Object.keys(groups)

  const chosen = pool.filter((q) => sel[q[0]]).map((q) => q[0])

  // Starter + saved together, with the team default pinned to the top.
  const allSets = [
    ...BUILTIN_SETS.map((s) => ({ ...s, builtin: true })),
    ...saved.map((s) => ({ ...s, builtin: false })),
  ]
  const ordered = [...allSets].sort((a, b) => (b.id === defaultId ? 1 : 0) - (a.id === defaultId ? 1 : 0))

  function toggle(id) { setSel((s) => ({ ...s, [id]: !s[id] })) }
  function clear() { setSel({}); setName(''); setNote('') }

  function loadInto(s) {
    const m = {}
    ;(s.question_ids || []).forEach((id) => { m[id] = true })
    setSel(m)
    setName(s.builtin ? '' : s.name)
    setNote(s.note || '')
    setTab('build')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function makeDefault(id) {
    try { await setSetting('default_set', id); toast('Set as the default for the Run tab') }
    catch (e) { toast(e.message || 'Could not set the default') }
  }

  async function saveSet() {
    if (!name.trim() || !chosen.length) return
    setBusy(true)
    try { await addSet(name.trim(), chosen, note.trim()); toast('Set saved for the team'); clear() }
    catch (e) { toast(e.message || 'Could not save') }
    finally { setBusy(false) }
  }

  async function removeSet(id) {
    try { await deleteSet(id); toast('Set deleted') }
    catch { toast('Could not delete') }
  }

  async function removeQuestion(q) {
    if (!window.confirm(`Delete this question for the whole team?\n\n${q[2]}`)) return
    try { await deleteQuestion(q[0]); toast('Question deleted') }
    catch (e) { toast(e.message || 'Could not delete') }
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow">Question library</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
            Question sets
          </h1>
          <p className="lede">The sets your team runs interviews from, and the shared question pool. Pick a default, or build a new set. Everything here syncs live for the whole team.</p>
        </div>
        {tab === 'build' && <button className="btn" onClick={() => setQEdit({ grp: '', body: '' })}>+ Add question</button>}
      </div>

      <div className="row" style={{ gap: 6 }}>
        <button type="button" className={'chip' + (tab === 'sets' ? ' on' : '')} onClick={() => setTab('sets')}>Saved sets</button>
        <button type="button" className={'chip' + (tab === 'build' ? ' on' : '')} onClick={() => setTab('build')}>Build a set</button>
      </div>

      {tab === 'sets' && (
        <div className="card">
          <div className="hd">
            <h2>Saved &amp; starter sets</h2>
            <span className="note">{defaultId ? 'default loads first on Run' : 'pick a default below'}</span>
          </div>
          <div className="bd" style={{ display: 'grid', gap: 10 }}>
            {loading && <div className="empty"><span className="spin" /></div>}
            {ordered.map((s) => (
              <SetRow
                key={s.id}
                s={s}
                builtin={s.builtin}
                isDefault={s.id === defaultId}
                onLoad={() => loadInto(s)}
                onMakeDefault={() => makeDefault(s.id)}
                onDelete={s.builtin ? undefined : () => removeSet(s.id)}
              />
            ))}
          </div>
        </div>
      )}

      {tab === 'build' && (
        <>
          <div className="card">
            <div className="hd">
              <h2>Build a set</h2>
              <span className="note">{chosen.length} selected</span>
            </div>
            <div className="bd" style={{ display: 'grid', gap: 12 }}>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
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
                <button className="btn" onClick={saveSet} disabled={busy || !name.trim() || !chosen.length}>
                  {busy ? 'Saving…' : 'Save set for the team'}
                </button>
                <button className="btn ghost" onClick={clear} disabled={busy}>Clear</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="hd">
              <h2>Pick questions</h2>
              <span className="note">{pool.length} in the pool</span>
            </div>
            <div className="bd">
              {groupNames.map((grp) => (
                <div className="poolgrp" key={grp}>
                  <h3>{grp}</h3>
                  <div className="grid" style={{ gap: 8 }}>
                    {groups[grp].map((q) => (
                      <div key={q[0]} style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                        <label className={'qpick' + (sel[q[0]] ? ' on' : '')} style={{ flex: 1, minWidth: 0 }}>
                          <input type="checkbox" checked={!!sel[q[0]]} onChange={() => toggle(q[0])} />
                          <span><span className="id">{q[0]}</span> &nbsp;{q[2]}</span>
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <button className="btn ghost sm" title="Edit" onClick={() => setQEdit({ id: q[0], grp: q[1], body: q[2] })}>Edit</button>
                          <button className="btn danger sm" title="Delete" onClick={() => removeQuestion(q)}>Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {qEdit && (
        <QuestionEditor
          draft={qEdit}
          groupNames={groupNames}
          onClose={() => setQEdit(null)}
          onSaved={() => { setQEdit(null); toast('Saved for the team') }}
        />
      )}
    </div>
  )
}

function QuestionEditor({ draft, groupNames, onClose, onSaved }) {
  const isEdit = Boolean(draft.id)
  const [grp, setGrp] = useState(draft.grp || '')
  const [body, setBody] = useState(draft.body || '')
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  async function save() {
    if (!body.trim()) return
    setBusy(true)
    try {
      if (isEdit) await updateQuestion(draft.id, { grp: grp.trim() || 'Custom', body: body.trim() })
      else await addQuestion(grp.trim(), body.trim())
      onSaved()
    } catch (e) { toast(e.message || 'Could not save') } finally { setBusy(false) }
  }

  return (
    <Modal onClose={onClose}>
      <div className="hd" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
        <h2 style={{ fontSize: 17 }}>{isEdit ? 'Edit question' : 'Add a question'}</h2>
        <button className="theme-btn" onClick={onClose}>Close</button>
      </div>
      <div style={{ padding: 20, display: 'grid', gap: 14 }}>
        <div className="field">
          <label htmlFor="qgrp">Group <span className="hint">(pick one or type a new one)</span></label>
          <input id="qgrp" className="inp" list="group-list" value={grp} placeholder="e.g. Benefits" onChange={(e) => setGrp(e.target.value)} />
          <datalist id="group-list">
            {groupNames.map((g) => <option key={g} value={g} />)}
          </datalist>
        </div>
        <div className="field">
          <label htmlFor="qbody">Question</label>
          <textarea id="qbody" className="inp" style={{ minHeight: 90 }} value={body} placeholder="Write the question exactly as you would ask it." onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn" onClick={save} disabled={busy || !body.trim()}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add question'}</button>
        </div>
      </div>
    </Modal>
  )
}

function SetRow({ s, builtin, isDefault, onLoad, onDelete, onMakeDefault }) {
  return (
    <div style={{
      border: '1px solid ' + (isDefault ? 'var(--accent)' : 'var(--line)'),
      borderRadius: 12, padding: '13px 15px', display: 'grid', gap: 7,
      background: isDefault ? 'var(--accent-soft)' : 'transparent',
    }}>
      <div className="row" style={{ justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div className="row" style={{ gap: 8 }}>
          <strong style={{ fontSize: 14.5 }}>{s.name}</strong>
          {builtin
            ? <span className="tag b">starter</span>
            : <span className="tag s-done">{(s.question_ids || []).length} questions</span>}
          {isDefault && <span className="tag b">default</span>}
        </div>
        <div className="row" style={{ gap: 6 }}>
          {isDefault
            ? <span style={{ fontSize: 12, color: 'var(--accent-ink)', fontWeight: 600 }}>Loads on Run</span>
            : <button className="btn ghost sm" onClick={onMakeDefault}>Make default</button>}
          <button className="btn ghost sm" onClick={onLoad}>Load &amp; edit</button>
          {onDelete && <button className="btn danger sm" onClick={onDelete}>Delete</button>}
        </div>
      </div>
      {s.note && <div style={{ fontSize: 12.5, color: isDefault ? 'var(--accent-ink)' : 'var(--muted)' }}>{s.note}</div>}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>
        {(s.question_ids || []).join(' · ')}
      </div>
    </div>
  )
}
