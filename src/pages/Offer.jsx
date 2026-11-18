import { useEffect, useRef } from 'react'
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
      <div className="offer-wrap">
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
