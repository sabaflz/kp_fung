import { useEffect, useLayoutEffect, useRef } from 'react'
import { startVisit, readSource, track, withTest } from '../lib/track.js'
import TestBanner from '../components/TestBanner.jsx'
import { FlyerSheet, FLYER_TOP } from './Bet3.jsx'

/* The flyer on its own, public, no sign-in.

   Bet #3 asked whether someone shown this clicks through unprompted within a
   minute. Of five people, nobody did. Two read it all the way through and
   waited, two never pressed anything, and the reason was the same each time:
   on a screen a letter-shaped sheet reads as a printed poster, so people do
   not expect any of it to do something. One said she assumed we were going to
   hand it to her in person.

   Three things answer that, and none of them tells anyone to click:
   1. An action bar fixed to the bottom of the window. It is the one piece of
      the page that is obviously app chrome rather than paper, and unlike the
      button inside the sheet it is on screen from the first moment. The old
      button sat below the fold on a laptop, so for the first stretch of the
      session there was nothing visible to press.
   2. Every benefit is its own control, so there are four ways in instead of
      one, and each carries its own hover and press state.
   3. The button inside the sheet now reads as a button: an arrow, a shadow,
      and it lifts and depresses under the pointer.

   Privacy is unchanged: no IP, no cookie, a random in-memory session id. */
export default function Offer() {
  const source = useRef('direct')

  useEffect(() => {
    startVisit()
    source.current = readSource(window.location.search, document.referrer)
    track('flyer', { source: source.current })
    document.title = '$300 a year. Spend it your way.'
  }, [])

  /* Fit the whole flyer in the window, on any screen, with nothing cut off
     and nothing to scroll. People in the Bet #3 sessions did not scroll, so
     anything below the fold may as well not exist.

     The sheet is laid out at some width, measured, and scaled down until its
     full height fits between the top of the window and the action bar. A
     wider sheet is a shorter one, so when it has to shrink we also let it
     grow wider (up to a cap) and try again. That keeps the text as large as
     the screen allows instead of just shrinking a tall narrow page. */
  const wrap = useRef(null)
  const fit = useRef(null)
  const sheet = useRef(null)
  useLayoutEffect(() => {
    const run = () => {
      const w = wrap.current, f = fit.current, sh = sheet.current
      if (!w || !f || !sh) return
      const bar = document.querySelector('.offer-bar')
      const top = w.getBoundingClientRect().top + window.scrollY
      const availH = window.innerHeight - top - (bar ? bar.offsetHeight : 0) - 16
      const availW = window.innerWidth - 16
      const phone = window.innerWidth <= 560
      const base = phone ? availW : Math.min(availW, 816)
      const cap = phone ? 620 : 1180
      // Try a range of widths and keep whichever lets the text be largest.
      // Too narrow and the sheet is too tall; too wide and it has to shrink
      // to fit sideways. The best width is somewhere between.
      let scale = 0, width = base
      const steps = 14
      for (let i = 0; i <= steps; i++) {
        const cand = base + ((Math.max(cap, base) - base) * i) / steps
        sh.style.width = cand + 'px'
        const sc = Math.min(1, availH / sh.offsetHeight, availW / cand)
        if (sc > scale + 0.001) { scale = sc; width = cand }
      }
      sh.style.width = width + 'px'
      sh.style.transform = `scale(${scale})`
      f.style.width = Math.floor(width * scale) + 'px'
      f.style.height = Math.floor(sh.offsetHeight * scale) + 'px'
    }
    run()
    window.addEventListener('resize', run)
    document.fonts?.ready?.then(run).catch(() => {})
    const t = setTimeout(run, 400)
    return () => { window.removeEventListener('resize', run); clearTimeout(t) }
  }, [])

  // Which control they pressed is worth knowing: if nobody ever uses the one
  // inside the sheet, that tells us the sheet itself is the problem.
  const go = (label) => async (e) => {
    if (e) e.preventDefault()
    const href = withTest(`/plan?src=${encodeURIComponent(source.current)}`)
    await Promise.race([
      track('flyer_click', { label, source: source.current }),
      new Promise((r) => setTimeout(r, 900)),
    ])
    window.location.assign(href)
  }

  return (
    <>
      <TestBanner />
      <div className="offer-wrap" ref={wrap}>
        <div className="offer-fit" ref={fit}>
        <div className="offer-sheet" ref={sheet}>
        <FlyerSheet
          top={FLYER_TOP}
          onBenefit={(id, e) => go(`benefit: ${id}`)(e)}
          cta={
            <a className="fl-cta-btn" href="/plan" onClick={go('in-sheet button')}>
              See what is included <span aria-hidden="true">&rarr;</span>
            </a>
          }
        />
        </div>
        </div>
      </div>

      <div className="offer-bar">
        <div className="offer-bar-in">
          <span className="offer-bar-t">$300 a year, spent the way you would spend it.</span>
          <a className="offer-bar-btn" href="/plan" onClick={go('sticky bar')}>
            See what is included <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </>
  )
}
