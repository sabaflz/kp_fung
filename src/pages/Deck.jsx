import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { canEdit } from '../lib/team.js'
import { DECKS } from '../decks/index.js'

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

/* Full-screen present mode for one deck: arrow keys move between slides, the
   team can toggle presenter notes, and anyone can download the deck as a PDF. */
export default function Deck({ deckId = 'bet1' }) {
  const deck = DECKS[deckId] || DECKS.bet1
  const navigate = useNavigate()
  const { session } = useAuth()
  const team = canEdit(session?.user?.email || '')
  const n = deck.slides.length
  const [i, setI] = useState(0)
  const [notes, setNotes] = useState(false)

  const go = useCallback((x) => setI((c) => Math.min(Math.max(x, 0), n - 1)), [n])
  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    navigate('/bets')
  }, [navigate])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(i + 1) }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(i - 1) }
      else if (e.key === 'Escape') { if (notes) setNotes(false); else exit() }
      else if ((e.key === 'n' || e.key === 'N') && team) { setNotes((v) => !v) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [i, go, exit, notes, team])

  const toggleFull = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen?.().catch(() => {})
  }

  const slide = deck.slides[i]

  return (
    <div className="present">
      <div className="present-stage">
        <DeckStage><div className="sld">{slide.node}</div></DeckStage>
        {team && notes && (
          <div className="deck-notes">
            <span className="deck-notes-k">Presenter notes &middot; slide {i + 1}</span>
            <p>{slide.notes || 'No notes for this slide.'}</p>
          </div>
        )}
      </div>

      <div className="present-bar">
        <button className="btn ghost sm" type="button" onClick={exit}>&times; Exit</button>
        <div className="present-mid">
          <button className="btn ghost sm" type="button" onClick={() => go(i - 1)} disabled={i === 0}>&larr; Prev</button>
          <span className="present-count">{i + 1} / {n}</span>
          <button className="btn ghost sm" type="button" onClick={() => go(i + 1)} disabled={i === n - 1}>Next &rarr;</button>
        </div>
        <div className="present-mid">
          {team && <button className="btn ghost sm" type="button" onClick={() => setNotes((v) => !v)}>{notes ? 'Hide notes' : 'Notes'}</button>}
          <button className="btn ghost sm" type="button" onClick={() => window.print()}>Download PDF</button>
          <button className="btn ghost sm" type="button" onClick={toggleFull}>Full screen</button>
        </div>
      </div>

      {/* Printed/exported as PDF: all slides, one per page. */}
      <div className="deck-print">
        {deck.slides.map((s) => (<div className="sld" key={s.id}>{s.node}</div>))}
      </div>
    </div>
  )
}
