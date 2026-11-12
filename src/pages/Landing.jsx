import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase, isConfigured } from '../lib/supabase.js'
import { BENEFIT_BY_ID, analyzeResponses } from '../data/packages.js'
import { FLYER_COPY, DEFAULT_TOP } from './Bet3.jsx'
import BenefitIcon from '../components/BenefitIcon.jsx'
import { startVisit, readSource, track } from '../lib/track.js'

/* The page the flyer links to. Public, no sign-in.

   Bet #3 is about whether the flyer makes someone take a next step, so
   this page exists to give them several real next steps and to record
   which one they take and how long it took. Every section below is
   something a person could actually want to know before deciding, not a
   button invented to be clicked. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SECTIONS = [
  {
    id: 'included',
    cta: 'See what is included',
    title: 'What is included',
    body: (top) => (
      <>
        <p>
          One allowance of <b>$300 a year</b> that you split across these, in whatever mix suits you.
          You would not have to decide up front, and anything you do not use in one area stays
          available for another.
        </p>
        <ul className="lp-list">
          {top.map((id) => (
            <li key={id}>
              <span className="lp-list-ico"><BenefitIcon name={BENEFIT_BY_ID[id].icon} size={18} /></span>
              <span>
                <b>{FLYER_COPY[id].kicker}.</b> {FLYER_COPY[id].points.join('. ')}.
              </span>
            </li>
          ))}
        </ul>
        <p className="lp-small">
          The amounts and limits inside each one are placeholders. Working out what they should be
          is exactly what this research is for.
        </p>
      </>
    ),
  },
  {
    id: 'eligibility',
    cta: 'Who would be able to get it',
    title: 'Who it would be for',
    body: () => (
      <>
        <p>
          We are designing this around adults roughly <b>18 to 30</b> who are responsible for their own
          health coverage, whether that is a plan you buy yourself, one you chose through work, or a
          student plan you manage.
        </p>
        <p>
          That said, a benefit like this would almost certainly be sold to everyone on a plan rather
          than restricted by age. So think of 18 to 30 as who we are designing <i>for</i>, not who
          would be allowed to have it.
        </p>
        <p className="lp-small">
          There are no eligibility rules to show you yet, because there is no plan yet. If this
          becomes real, that is one of the first things that would be written down.
        </p>
      </>
    ),
  },
  {
    id: 'how',
    cta: 'How it would work',
    title: 'How it would work',
    body: () => (
      <>
        <ol className="lp-steps">
          <li><b>Add it</b><span>You would choose it alongside a health plan when you enrol, the same way dental is added today.</span></li>
          <li><b>Use it</b><span>Spend the $300 across the benefits above during the year, in any mix.</span></li>
          <li><b>See it</b><span>Your balance and what it covers would sit in the same place as the rest of your plan.</span></li>
        </ol>
        <p className="lp-small">
          None of this is settled. It is the shape we are testing, and the part we most want to be
          told is wrong.
        </p>
      </>
    ),
  },
  {
    id: 'real',
    cta: 'Is this real?',
    title: 'Is this real?',
    body: () => (
      <>
        <p>
          <b>Not yet, and we want to be straight about that.</b> This benefit does not exist. You cannot
          buy it, and nobody is selling it.
        </p>
        <p>
          We are a student research team at UC Berkeley trying to work out what extra health benefits
          young adults would actually use, because a lot of what gets offered is designed for people
          in very different situations.
        </p>
        <p>
          If enough people tell us they want something like this, that is the case we put to the
          people who design health plans. That is the whole reason the email box exists: it is
          evidence, not a mailing list.
        </p>
      </>
    ),
  },
]

export default function Landing() {
  const [open, setOpen] = useState(null)
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)
  const [rows, setRows] = useState([])
  const source = useRef('direct')
  const emailRef = useRef(null)

  useEffect(() => {
    startVisit()
    source.current = readSource(window.location.search, document.referrer)
    track('view', { source: source.current })
  }, [])

  // The three benefits come from the survey, so the page follows the evidence.
  useEffect(() => {
    if (!isConfigured) return
    let alive = true
    supabase.from('bet2_responses').select('age, choices')
      .then(({ data, error }) => { if (alive && !error) setRows(data || []) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const analysis = useMemo(() => analyzeResponses(rows), [rows])
  const top = analysis.n > 0 ? analysis.benefits.slice(0, 3).map((b) => b.id) : DEFAULT_TOP

  const toggle = useCallback((s) => {
    const next = open === s.id ? null : s.id
    setOpen(next)
    if (next) track('cta', { label: s.cta, source: source.current })
  }, [open])

  // Navigating cancels any request still in flight, so without this the
  // survey click, which is the step that matters most, is never recorded.
  // Waits for the write, but never traps someone behind a slow network.
  async function goToSurvey(e) {
    e.preventDefault()
    const href = e.currentTarget.getAttribute('href')
    await Promise.race([
      track('survey', { label: 'start survey', source: source.current }),
      new Promise((r) => setTimeout(r, 1200)),
    ])
    window.location.href = href
  }

  async function submitEmail(e) {
    e.preventDefault()
    const em = email.trim()
    if (!EMAIL_RE.test(em)) { setErr('That does not look like an email address.'); return }
    setErr('')
    await track('email', { label: 'landing signup', source: source.current })
    if (isConfigured) {
      try {
        const { error } = await supabase.from('bet2_followups').insert({
          respondent: null, email: em, top_benefit: null, enabler: null, wants_results: true,
        })
        if (error) console.warn('[landing] email not saved:', error.message)
      } catch (e2) { console.warn('[landing] email threw:', e2?.message || e2) }
    }
    setSent(true)
  }

  return (
    <div className="lp">
      <div className="lp-flag">This benefit does not exist yet. It is a research concept, not an offer.</div>

      <header className="lp-hero">
        <p className="lp-eyebrow">An idea we are testing</p>
        <h1 className="lp-h1">$300 a year.<br />Spend it your way.</h1>
        <p className="lp-sub">
          One allowance on top of a health plan, for the kinds of care young adults keep telling us
          they put off. You would decide how to split it.
        </p>
        <div className="lp-chips">
          {top.map((id) => (
            <span key={id} className="lp-chip">
              <BenefitIcon name={BENEFIT_BY_ID[id].icon} size={16} />
              {BENEFIT_BY_ID[id].name}
            </span>
          ))}
        </div>
      </header>

      <section className="lp-ctas" aria-label="Find out more">
        {SECTIONS.map((s) => (
          <div key={s.id} className={'lp-acc' + (open === s.id ? ' is-open' : '')}>
            <button type="button" className="lp-cta" aria-expanded={open === s.id} onClick={() => toggle(s)}>
              <span>{s.cta}</span>
              <span className="lp-cta-mark" aria-hidden="true">{open === s.id ? '−' : '+'}</span>
            </button>
            {open === s.id && (
              <div className="lp-acc-body">
                <h2>{s.title}</h2>
                {s.body(top)}
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="lp-survey">
        <h2>Help us get it right</h2>
        <p>
          The quickest way to tell us what you want is the two-minute survey. You pick between
          packages ten times, and at the end you see what your own answers say about you.
        </p>
        <a
          className="lp-btn"
          href={`/packages?src=${encodeURIComponent(source.current)}`}
          onClick={goToSurvey}
        >
          Take the 2-minute survey
        </a>
      </section>

      <section className="lp-email">
        {sent ? (
          <div className="lp-sent">
            <b>You are on the list.</b>
            <span>We will send you what we find. Nothing else.</span>
          </div>
        ) : (
          <>
            <h2>Want to know how this turns out?</h2>
            <p>
              Leave your email and we will tell you what we learn. If enough people want something
              like this, that is the case we put to the people who design health plans.
            </p>
            <form className="lp-form" onSubmit={submitEmail}>
              <input
                ref={emailRef}
                className="lp-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-label="Your email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (err) setErr('') }}
              />
              <button className="lp-btn" type="submit">Keep me posted</button>
            </form>
            {err && <p className="lp-err">{err}</p>}
            <p className="lp-small">
              A couple of emails about this study at most, then nothing. No ads, no newsletter, and
              no health insurer is offering this. Ask us to delete your address any time and we will.
            </p>
          </>
        )}
      </section>

      <footer className="lp-foot">
        <p>
          Made by a student research team at UC Berkeley. The $300 and everything inside it are
          placeholders used for research, and nothing here has been priced or approved. No health
          insurer is offering this, and this is not an offer of coverage.
        </p>
      </footer>
    </div>
  )
}
