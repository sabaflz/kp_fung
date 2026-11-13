import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { canEdit } from '../lib/team.js'
import { supabase, isConfigured } from '../lib/supabase.js'
import { DECKS } from '../decks/index.js'
import { DeckContentCtx, T } from '../decks/content.jsx'

/* Scales a fixed 1280x720 slide canvas to fit its container, so each slide is
   one screen with no scrolling. */
function DeckStage({ children }) {
  const ref = useRef(null)
  const [scale, setScale] = useState(0.5)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      const r = el.getBoundingClientRect()
      if (r.width && r.height) setScale(Math.min(r.width / 1280, r.height / 720))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div className="deck-viewport" ref={ref}>
      <div className="deck-canvas" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>{children}</div>
    </div>
  )
}

/* Full-screen present mode for one deck. The team can edit the slide text in
   place; everyone else sees presentation only. */
export default function Deck({ deckId = 'bet1' }) {
  const deck = DECKS[deckId] || DECKS.bet1
  const navigate = useNavigate()
  const { session } = useAuth()
  const email = session?.user?.email || ''
  const team = canEdit(email) && isConfigured
  const n = deck.slides.length

  const [i, setI] = useState(0)
  const [notes, setNotes] = useState(false)
  const [editing, setEditing] = useState(false)
  const [overrides, setOverrides] = useState({})
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [saveError, setSaveError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [savedBy, setSavedBy] = useState(null) // { email, at } of the last save

  // Paths THIS session has edited. Everything else in `overrides` belongs to
  // whoever saved last, and must survive our save untouched.
  const changed = useRef(new Set())

  const load = useCallback(async ({ keepMine = false } = {}) => {
    if (!isConfigured) return
    const { data, error } = await supabase.from('deck_content')
      .select('content, updated_by, updated_at').eq('deck_id', deckId).maybeSingle()
    if (error) { setLoadError(error.message || 'Could not load saved edits.'); return }
    setLoadError('')
    setSavedBy(data?.updated_at ? { email: data.updated_by, at: data.updated_at } : null)
    setOverrides((mine) => {
      const theirs = data?.content || {}
      if (!keepMine) return theirs
      // Take everything new, but never discard an edit this session has not
      // saved yet just because we refreshed.
      const merged = { ...theirs }
      for (const p of changed.current) merged[p] = mine[p]
      return merged
    })
  }, [deckId])

  useEffect(() => { load() }, [load])

  // The deck used to read the saved text once and never again, so two people
  // with it open never saw each other's work and it looked as if saving did
  // nothing. Refetch whenever the tab comes back to the front, which is what
  // actually happens when you switch to another window and return.
  useEffect(() => {
    if (!isConfigured) return
    const refresh = () => { if (!document.hidden) load({ keepMine: true }) }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [load])

  const setField = useCallback((path, value) => {
    setOverrides((prev) => {
      if ((prev[path] ?? '') === value) return prev
      changed.current.add(path)
      setDirty(true)
      setSaveState('idle')
      return { ...prev, [path]: value }
    })
  }, [])

  const save = useCallback(async () => {
    if (!isConfigured) { setSaveState('error'); setSaveError('Not connected to Supabase yet.'); return }
    setSaveState('saving')
    setSaveError('')

    // Read before writing, and send only the fields this session changed
    // merged onto whatever is stored now.
    //
    // Saving the whole overrides object was silent data loss: two people
    // editing different slides would each save a snapshot taken when their
    // page loaded, and the second save would quietly undo the first. Nobody
    // would see an error, and the lost edit would just be gone.
    const { data: current, error: readErr } = await supabase.from('deck_content')
      .select('content').eq('deck_id', deckId).maybeSingle()
    if (readErr) {
      setSaveState('error')
      setSaveError('Could not check for other edits, so nothing was saved: ' + (readErr.message || ''))
      return false
    }
    const merged = { ...(current?.content || {}) }
    for (const p of changed.current) merged[p] = overrides[p]

    const stamp = new Date().toISOString()
    const { error } = await supabase.from('deck_content')
      .upsert({ deck_id: deckId, content: merged, updated_by: email, updated_at: stamp }, { onConflict: 'deck_id' })
    if (error) {
      setSaveState('error')
      setSaveError(error.message || 'Save failed.')
      return false
    }
    changed.current.clear()
    setOverrides(merged)
    setSavedBy({ email, at: stamp })
    setDirty(false)
    setSaveState('saved')
    return true
  }, [deckId, overrides, email])

  const go = useCallback((x) => setI((c) => Math.min(Math.max(x, 0), n - 1)), [n])
  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    navigate('/bets')
  }, [navigate])

  useEffect(() => {
    const onKey = (e) => {
      if (editing) { if (e.key === 'Escape') document.activeElement?.blur?.(); return }
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(i + 1) }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(i - 1) }
      else if (e.key === 'Escape') { if (notes) setNotes(false); else exit() }
      else if ((e.key === 'n' || e.key === 'N') && team) setNotes((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [i, go, exit, notes, team, editing])

  const toggleFull = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen?.().catch(() => {})
  }
  const doneEditing = async () => {
    const ok = dirty ? await save() : true
    // Keep edit mode open if the save failed, so changes aren't lost silently.
    if (ok) setEditing(false)
  }

  const slide = deck.slides[i]
  const ctx = { overrides, editing, setField }

  return (
    <DeckContentCtx.Provider value={ctx}>
      <div className={'present' + (editing ? ' editing' : '')}>
        {editing && (
          <div className={'deck-edithint' + (saveState === 'error' ? ' error' : '')}>
            {saveState === 'error'
              ? `Save failed: ${saveError}`
              : `Click any text to edit. ${dirty ? 'Unsaved changes.' : saveState === 'saved' ? 'All changes saved.' : 'Changes save for the whole team.'}`}
          </div>
        )}
        {team && loadError && !editing && (
          <div className="deck-edithint error">Couldn't load saved edits: {loadError}</div>
        )}
        <div className="present-stage">
          <DeckStage><div className="sld">{slide.node}</div></DeckStage>
          {team && notes && (
            <div className="deck-notes">
              <span className="deck-notes-k">Presenter notes · slide {i + 1}</span>
              <p><T p={`${slide.id}.notes`}>{slide.notes}</T></p>
            </div>
          )}
        </div>

        <div className="present-bar">
          <button className="btn ghost sm" type="button" onClick={exit}>× Exit</button>
          <div className="present-mid">
            <button className="btn ghost sm" type="button" onClick={() => go(i - 1)} disabled={i === 0 || editing}>← Prev</button>
            <span className="present-count">{i + 1} / {n}</span>
            <button className="btn ghost sm" type="button" onClick={() => go(i + 1)} disabled={i === n - 1 || editing}>Next →</button>
          </div>
          <div className="present-mid">
            {/* Who saved last. Without this, a teammate's edit arriving (or
                failing to arrive) is invisible, which is exactly how this
                looked broken when it was working. */}
            {team && savedBy?.at && (
              <span
                className="present-count"
                title={`Last saved ${new Date(savedBy.at).toLocaleString()}${savedBy.email ? ' by ' + savedBy.email : ''}`}
              >
                {(() => {
                  const mins = Math.round((Date.now() - new Date(savedBy.at)) / 60000)
                  const when = mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : new Date(savedBy.at).toLocaleDateString()
                  const who = !savedBy.email ? '' : savedBy.email === email ? 'you' : savedBy.email.split('@')[0]
                  return who ? `Edited ${when} by ${who}` : `Edited ${when}`
                })()}
              </span>
            )}
            {team && !editing && <button className="btn ghost sm" type="button" onClick={() => setEditing(true)}>Edit text</button>}
            {team && editing && (
              <>
                <button className="btn ghost sm" type="button" onClick={save} disabled={!dirty || saveState === 'saving'}>
                  {saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Retry save' : saveState === 'saved' && !dirty ? 'Saved' : 'Save'}
                </button>
                <button className="btn sm" type="button" onClick={doneEditing}>Done</button>
              </>
            )}
            {team && <button className="btn ghost sm" type="button" onClick={() => setNotes((v) => !v)}>{notes ? 'Hide notes' : 'Notes'}</button>}
            {!editing && <button className="btn ghost sm" type="button" onClick={() => window.print()}>Download PDF</button>}
            {!editing && <button className="btn ghost sm" type="button" onClick={toggleFull}>Full screen</button>}
          </div>
        </div>

        {/* Printed/exported as PDF: all slides, one per page (view mode only). */}
        {!editing && (
          <div className="deck-print">
            {deck.slides.map((s) => (<div className="sld" key={s.id}>{s.node}</div>))}
          </div>
        )}
      </div>
    </DeckContentCtx.Provider>
  )
}
