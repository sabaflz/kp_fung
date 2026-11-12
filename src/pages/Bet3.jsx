import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase, isConfigured } from '../lib/supabase.js'
import { BENEFIT_BY_ID, analyzeResponses } from '../data/packages.js'
import BenefitIcon from '../components/BenefitIcon.jsx'

/* Bet #3: a concept flyer for the package the survey is pointing at.

   The three benefits on the flyer are NOT typed in. They are whichever three
   are leading the Bet #2 survey right now, so the flyer follows the evidence
   as more responses arrive. There is deliberately no price on it: Bet #3 is
   about making the benefits specific, not about what people would pay. */

// How each benefit reads on a flyer. Written to answer the comprehension
// problem from Bet #1: say exactly what you get, in plain words.
const FLYER_COPY = {
  dental: {
    kicker: 'Dental',
    line: 'Cleanings covered. Help when you need a filling.',
    points: ['Two cleanings and X-rays a year', 'Money toward fillings and other dental work', 'See a dentist near you'],
  },
  mental: {
    kicker: 'Therapy & mental health',
    line: 'Talk to someone, without the runaround.',
    points: ['Covered therapy or counseling sessions', 'No referral needed to start', 'In person, by phone, or by video'],
  },
  fitness: {
    kicker: 'Move your way',
    line: 'Not just a gym. Whatever keeps you moving.',
    points: ['Put it toward a gym, a climbing pass, or classes', 'Works for a run club, yoga, or a mobility program', 'You pick. It changes when you do'],
  },
  vision: {
    kicker: 'Vision',
    line: 'An eye exam, and money toward what you wear.',
    points: ['A yearly eye exam', 'Money toward glasses or contacts', 'Pick the frames you actually like'],
  },
  everyday: {
    kicker: 'Everyday health',
    line: 'The stuff insurance usually skips.',
    points: ['Cold and allergy medicine', 'Vitamins, first aid, and sunscreen', 'Order online or pick up in store'],
  },
  nutrition: {
    kicker: 'Nutrition',
    line: 'A dietitian in your corner.',
    points: ['One-on-one sessions with a registered dietitian', 'A plan built around how you actually eat', 'By video, on your schedule'],
  },
}

const DEFAULT_TOP = ['dental', 'vision', 'mental']

export default function Bet3() {
  const [rows, setRows] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [params, setParams] = useSearchParams()
  const bullseyeOnly = params.get('who') === 'bullseye'

  const setParam = (k, v) => {
    const next = new URLSearchParams(params)
    next.set(k, v)
    setParams(next, { replace: true })
  }

  const refresh = useCallback(async () => {
    if (!isConfigured) { setLoaded(true); return }
    const { data, error } = await supabase.from('bet2_responses').select('age, choices')
    if (!error) setRows(data || [])
    setLoaded(true)
  }, [])

  useEffect(() => {
    refresh()
    if (!isConfigured) return
    const ch = supabase.channel('bet3-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bet2_responses' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [refresh])

  // Only while this page is open, printing produces the flyer alone on a letter page.
  useEffect(() => {
    // The decks set a 1280x720 print page for the whole app. While the flyer is
    // open, a later rule switches printing to a letter page instead.
    const style = document.createElement('style')
    style.textContent = '@page{size:letter;margin:0}'
    document.head.appendChild(style)
    document.documentElement.classList.add('fl-print')
    return () => { document.documentElement.classList.remove('fl-print'); style.remove() }
  }, [])

  const a = useMemo(() => analyzeResponses(rows, { bullseyeOnly }), [rows, bullseyeOnly])
  const fromData = a.n > 0
  const top = fromData ? a.benefits.slice(0, 3).map((b) => b.id) : DEFAULT_TOP
  const topPackageDiffers = fromData && a.packages.length > 0 &&
    a.packages[0].ids.slice().sort().join('+') !== top.slice().sort().join('+')
  const surveyUrl = (typeof window !== 'undefined' ? window.location.host : '') + '/packages'

  return (
    <div className="b3">
      <div className="b3-top">
        <span className="bp-eyebrow">Bet #3 <span className="bp-dot">·</span> Draft</span>
        <h1 className="bp-title">The package, as a flyer</h1>
        <p className="bp-lede">
          Bet #1 told us people want a flexible allowance they control. Bet #2 is telling us which
          benefits they reach for first. This puts the two together as one page a member could read
          in thirty seconds.
        </p>
      </div>

      <div className="b3-bar">
        <div className="b3-evidence">
          {!loaded ? 'Loading the survey results…' : fromData ? (
            <>
              <b>Built from live data.</b> The three benefits below are the current top three across{' '}
              {a.n} {bullseyeOnly ? 'bullseye ' : ''}{a.n === 1 ? 'response' : 'responses'}:{' '}
              {top.map((id) => `${BENEFIT_BY_ID[id].name} ${Math.round(a.benefits.find((b) => b.id === id).mean * 100)}%`).join(', ')}.
              If the ranking changes, the flyer changes with it.
              {topPackageDiffers && (
                <> Worth knowing: the single most-picked package is {a.packages[0].ids.map((id) => BENEFIT_BY_ID[id].name).join(' + ')},
                which is not the same three. That is a sign second and third place are still open.</>
              )}
            </>
          ) : (
            <>
              <b>No survey data to draw on{bullseyeOnly ? ' for this group' : ''} yet,</b> so this shows a starting
              set. Once responses come in, the top three take over automatically.
            </>
          )}
        </div>
        <div className="b3-controls">
          <div className="b2-seg" role="group" aria-label="Who to build from">
            <button type="button" aria-pressed={!bullseyeOnly} onClick={() => setParam('who', 'all')}>Everyone</button>
            <button type="button" aria-pressed={bullseyeOnly} onClick={() => setParam('who', 'bullseye')}>Bullseye 18 to 30</button>
          </div>
          <button type="button" className="btn sm" onClick={() => window.print()}>Print or save as PDF</button>
        </div>
      </div>

      <div className="fl-scroll">
        <article className="fl-page">
          <div className="fl-concept">Concept only. A student research mock-up, not a real plan or offer.</div>

          <header className="fl-hero">
            <p className="fl-eyebrow">Extra benefits for the life you actually have</p>
            <h2 className="fl-h1">$300 a year.<br />Spend it your way.</h2>
            <p className="fl-sub">
              One allowance on top of your health plan, for the kinds of care young adults
              told us matter most to them. You decide how to split it.
            </p>
          </header>

          <section className="fl-benefits">
            {top.map((id) => {
              const c = FLYER_COPY[id]
              return (
                <div key={id} className="fl-benefit">
                  <span className="fl-ico"><BenefitIcon name={BENEFIT_BY_ID[id].icon} size={26} /></span>
                  <h3>{c.kicker}</h3>
                  <p className="fl-line">{c.line}</p>
                  <ul>{c.points.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
              )
            })}
          </section>

          <section className="fl-how">
            <h3>How it works</h3>
            <ol>
              <li><b>Add it</b><span>Choose it alongside your health plan when you enroll.</span></li>
              <li><b>Use it</b><span>Spend your $300 across these benefits in whatever mix fits your year.</span></li>
              <li><b>See it</b><span>Your balance and what it covers live in the same app as the rest of your care.</span></li>
            </ol>
          </section>

          <section className="fl-cta">
            <div className="fl-cta-text">
              <b>Help us get the details right.</b>
              <span>Tell us what you would want from benefits like these at <u>{surveyUrl}</u></span>
            </div>
          </section>

          <footer className="fl-foot">
            <p>The $300 allowance is a placeholder used for research. The amount and what it can be spent on have not been set or approved.</p>
            <p>This page was made by UC Berkeley Fung Fellowship students for a class project with partners at Kaiser Permanente. It does not describe a benefit that exists today and is not an offer of coverage.</p>
          </footer>
        </article>
      </div>

      <div className="b3-notes">
        <h3 className="b2-h3">What is a placeholder here</h3>
        <ul>
          <li>The <b>$300</b> is the same assumed value we used in Bets #1 and #2. It is not a costed number.</li>
          <li>There is <b>no price</b> on it, on purpose. Asking people what they would pay is a leading question, and the benefits are not final yet.</li>
          <li>The <b>three benefits</b> come straight from the survey. Second and third place are close, so expect them to move.</li>
          <li>The <b>bullet points</b> under each benefit describe what a member would get in plain words. They still need real limits from KP.</li>
        </ul>
        <Link className="btn ghost sm" to="/bets/2">See the survey results behind this</Link>
      </div>
    </div>
  )
}
