import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Bet1 from './Bet1.jsx'
import Bet2 from './Bet2.jsx'

/* Full-screen present mode: step through the bets like slides.
   Arrow keys / space move between them, Esc exits, and the app chrome is hidden. */
const SLIDES = [
  { id: 1, label: 'Bet #1', Comp: Bet1 },
  { id: 2, label: 'Bet #2', Comp: Bet2 },
]

export default function Present() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const start = Math.min(Math.max(parseInt(params.get('s') || '0', 10) || 0, 0), SLIDES.length - 1)
  const [i, setI] = useState(start)
  const Slide = SLIDES[i].Comp

  const go = useCallback((n) => setI((cur) => Math.min(Math.max(n, 0), SLIDES.length - 1)), [])

  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    navigate('/bets')
  }, [navigate])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(i + 1) }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(i - 1) }
      else if (e.key === 'Escape') { exit() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [i, go, exit])

  const toggleFull = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen?.().catch(() => {})
  }

  return (
    <div className="present">
      <div className="present-stage">
        <div className="present-slide" key={i}><Slide embedded /></div>
      </div>
      <div className="present-bar">
        <button className="btn ghost sm" type="button" onClick={exit}>&times; Exit</button>
        <div className="present-mid">
          <button className="btn ghost sm" type="button" onClick={() => go(i - 1)} disabled={i === 0}>&larr; Prev</button>
          <span className="present-count">{i + 1} / {SLIDES.length}</span>
          <button className="btn ghost sm" type="button" onClick={() => go(i + 1)} disabled={i === SLIDES.length - 1}>Next &rarr;</button>
        </div>
        <button className="btn ghost sm" type="button" onClick={toggleFull}>Full screen</button>
      </div>
    </div>
  )
}
