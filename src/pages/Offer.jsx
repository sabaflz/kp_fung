import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase, isConfigured } from '../lib/supabase.js'
import { BENEFIT_BY_ID } from '../data/packages.js'
import { startVisit, readSource, track, withTest } from '../lib/track.js'
import TestBanner from '../components/TestBanner.jsx'
import { FlyerSheet, FLYER_TOP } from './Bet3.jsx'

/* The flyer on its own, public, no sign-in.

   Bet #3 asks whether someone shown the flyer clicks through unprompted
   within a minute. Until this page existed the flyer lived only on the
   team's signed-in page with its link written out as text, so a
   participant had nothing to click. Here the call to action is a real
   button, and the time from the flyer loading to the press is recorded,
   so nobody has to run a stopwatch. Same privacy rules as the landing
   page: no IP, no cookie, a random in-memory session id. */
export default function Offer() {
  const source = useRef('direct')

  useEffect(() => {
    startVisit()
    source.current = readSource(window.location.search, document.referrer)
    track('flyer', { source: source.current })
    document.title = '$300 a year. Spend it your way.'
  }, [])

  const top = FLYER_TOP

  const go = async (e) => {
    e.preventDefault()
    const href = withTest(`/plan?src=${encodeURIComponent(source.current)}`)
    // Record the click, but never keep someone waiting on it.
    await Promise.race([
      track('flyer_click', { label: 'see what is included', source: source.current }),
      new Promise((r) => setTimeout(r, 900)),
    ])
    window.location.assign(href)
  }

  return (
    <>
    <TestBanner />
    <div className="offer-wrap">
      <FlyerSheet
        top={top}
        cta={<a className="fl-cta-btn" href="/plan" onClick={go}>See what is included</a>}
      />
    </div>
    </>
  )
}
