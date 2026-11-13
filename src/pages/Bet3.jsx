import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase, isConfigured } from '../lib/supabase.js'
import { copyText, useToast } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { isOwner } from '../lib/team.js'
import { BENEFIT_BY_ID, analyzeResponses } from '../data/packages.js'
import BenefitIcon from '../components/BenefitIcon.jsx'

/* Bet #3: a concept flyer for the package the survey is pointing at.

   The three benefits on the flyer are NOT typed in. They are whichever three
   are leading the Bet #2 survey right now, so the flyer follows the evidence
   as more responses arrive. There is deliberately no price on it: Bet #3 is
   about making the benefits specific, not about what people would pay. */

// How each benefit reads on a flyer. Written to answer the comprehension
// problem from Bet #1: say exactly what you get, in plain words.
export const FLYER_COPY = {
  dental: {
    kicker: 'Dental',
    line: 'Cleanings covered. Help with fillings.',
    points: ['Two cleanings and X-rays a year', 'Money toward fillings and other dental work', 'See a dentist near you'],
  },
  mental: {
    kicker: 'Therapy & mental health',
    line: 'Therapy, without the runaround.',
    points: ['Covered therapy or counseling sessions', 'No referral needed to start', 'In person, by phone, or by video'],
  },
  fitness: {
    kicker: 'Move your way',
    line: 'Not just a gym.',
    points: ['Put it toward a gym, a climbing pass, or classes', 'Works for a run club, yoga, or a mobility program', 'You pick. It changes when you do'],
  },
  vision: {
    kicker: 'Vision',
    line: 'An eye exam, plus help with glasses.',
    points: ['A yearly eye exam', 'Money toward glasses or contacts', 'Pick the frames you actually like'],
  },
  everyday: {
    kicker: 'Everyday health',
    line: 'The stuff insurance skips.',
    points: ['Cold and allergy medicine', 'Vitamins, first aid, and sunscreen', 'Order online or pick up in store'],
  },
  nutrition: {
    kicker: 'Nutrition',
    line: 'A dietitian in your corner.',
    points: ['One-on-one sessions with a registered dietitian', 'A plan built around how you actually eat', 'By video, on your schedule'],
  },
}

export const DEFAULT_TOP = ['dental', 'vision', 'mental']

// Median is the honest middle for timings: one person who leaves the tab
// open for an hour would wreck a mean.
function median(xs) {
  if (!xs.length) return null
  const a = [...xs].sort((x, y) => x - y)
  const m = Math.floor(a.length / 2)
  return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2)
}
const secs = (ms) => (ms == null ? '—' : ms < 1000 ? '<1s' : Math.round(ms / 1000) + 's')

export default function Bet3() {
  const [rows, setRows] = useState([])
  const [events, setEvents] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [params, setParams] = useSearchParams()
  // Bullseye unless someone explicitly asks for everyone, so a bare link to
  // this page shows the flyer built for the age range it is aimed at.
  const bullseyeOnly = params.get('who') !== 'all'

  const setParam = (k, v) => {
    const next = new URLSearchParams(params)
    next.set(k, v)
    setParams(next, { replace: true })
  }

  const refresh = useCallback(async () => {
    if (!isConfigured) { setLoaded(true); return }
    const { data, error } = await supabase.from('bet2_responses').select('age, choices')
    if (!error) setRows(data || [])
    // Forgiving: if the table is not there yet, the flyer still renders.
    const ev = await supabase.from('landing_events').select('session, source, event, label, ms')
    setEvents(ev.error ? [] : (ev.data || []))
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
  const { session } = useAuth()
  const owner = isOwner(session?.user?.email || '')
  const toast = useToast()

  // The Bet #3 funnel. Each visit counts once per step, so somebody who
  // opens three sections is still one visitor who took a next step.
  const funnel = useMemo(() => {
    if (!events.length) return null
    const bySession = {}
    for (const e of events) {
      const v = (bySession[e.session] ||= { source: e.source || 'direct', cta: [], survey: false, email: false, firstMs: null })
      if (e.source) v.source = e.source
      if (e.event === 'cta') {
        v.cta.push(e.label || 'unlabelled')
        if (v.firstMs == null || (e.ms != null && e.ms < v.firstMs)) v.firstMs = e.ms
      }
      if (e.event === 'survey') v.survey = true
      if (e.event === 'email') v.email = true
    }
    const visits = Object.values(bySession)
    const clicked = visits.filter((v) => v.cta.length)
    const bySource = {}
    for (const v of visits) {
      const g = (bySource[v.source] ||= { source: v.source, visits: 0, clicked: 0, survey: 0, email: 0 })
      g.visits++
      if (v.cta.length) g.clicked++
      if (v.survey) g.survey++
      if (v.email) g.email++
    }
    const labels = {}
    for (const v of visits) for (const l of new Set(v.cta)) labels[l] = (labels[l] || 0) + 1
    return {
      visits: visits.length,
      clicked: clicked.length,
      survey: visits.filter((v) => v.survey).length,
      email: visits.filter((v) => v.email).length,
      clickRate: visits.length ? clicked.length / visits.length : 0,
      medianMs: median(clicked.map((v) => v.firstMs).filter((x) => x != null)),
      within60: clicked.filter((v) => v.firstMs != null && v.firstMs <= 60000).length,
      sources: Object.values(bySource).sort((a, b) => b.visits - a.visits),
      labels: Object.entries(labels).sort((a, b) => b[1] - a[1]),
    }
  }, [events])

  const topPackageDiffers = fromData && a.packages.length > 0 &&
    a.packages[0].ids.slice().sort().join('+') !== top.slice().sort().join('+')
  // Where the flyer sends people. This has to be the landing page, NOT the
  // survey: Bet #3 measures which of the four ways in somebody opens before
  // they commit, and a flyer pointing straight at /packages skips that page
  // entirely, so the funnel records nothing and the bet cannot be judged.
  //
  // VITE_SITE_URL lets a render for print or email carry the real domain
  // instead of whatever host it happened to be built on.
  const host = import.meta.env.VITE_SITE_URL
    || (typeof window !== 'undefined' ? window.location.host : '')
  const surveyUrl = host + '/plan'

  return (
    <div className="b3">
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
          <div className="fl-concept">This benefit does not exist. It is a research concept, not an offer.</div>

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
              <span>See what is included and tell us what you would want at <u>{surveyUrl}</u></span>
            </div>
          </section>

          <footer className="fl-foot">
            <p>The $300 allowance and everything inside it are placeholders used for research. Nothing here has been priced or approved.</p>
            <p>Made by a student research team at UC Berkeley. No health insurer is offering this, and nothing here is an offer of coverage. If enough people tell us they want something like this, that is the case we will put to the people who design health plans.</p>
          </footer>
        </article>
      </div>

      {funnel && (
        <div className="b3-notes">
          <div className="b2-resp-head">
            <h3 className="b2-h3">Bet #3 funnel</h3>
            {owner && (
              <button type="button" className="btn ghost sm" onClick={async () => {
                const head = `Bet #3 funnel, as of ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                const lines = [head,
                  `${funnel.visits} visits, ${funnel.clicked} took a next step (${Math.round(funnel.clickRate * 100)}%)`,
                  `${funnel.survey} started the survey, ${funnel.email} left an email`,
                  funnel.medianMs != null ? `Median time to first click: ${secs(funnel.medianMs)}` : '',
                  '', 'By source:',
                  ...funnel.sources.map((s) => `  ${s.source}: ${s.visits} visits, ${s.clicked} clicked, ${s.survey} survey, ${s.email} email`),
                  '', 'Most-opened:',
                  ...funnel.labels.map(([l, n]) => `  ${l}: ${n}`)].filter(Boolean).join('\n')
                toast((await copyText(lines)) ? 'Funnel copied' : 'Copy failed')
              }}>Copy funnel</button>
            )}
          </div>
          <p className="b2-desc" style={{ marginBottom: 16 }}>
            What people do after the flyer sends them to the landing page. A visit counts once per
            step, so someone who opens three sections is still one person who took a next step.
          </p>

          <div className="b3-funnel">
            {[
              ['Saw the page', funnel.visits, null],
              ['Took a next step', funnel.clicked, funnel.visits],
              ['Started the survey', funnel.survey, funnel.visits],
              ['Left an email', funnel.email, funnel.visits],
            ].map(([label, n, of]) => (
              <div key={label} className="b3-step">
                <span className="b3-step-n">{n}</span>
                <span className="b3-step-l">{label}</span>
                {of ? <span className="b3-step-p">{of ? Math.round((n / of) * 100) : 0}% of visits</span> : <span className="b3-step-p">&nbsp;</span>}
              </div>
            ))}
          </div>

          <p className="b2-fine">
            {funnel.medianMs != null
              ? <>Median time from landing to first click: <b>{secs(funnel.medianMs)}</b>. {funnel.within60} of {funnel.clicked} clicked within a minute.</>
              : <>Nobody has clicked yet, so there is no timing to report.</>}
          </p>

          {funnel.sources.length > 0 && (
            <>
              <h4 className="b2-resp-h4" style={{ marginTop: 22 }}>Where they came from</h4>
              <div className="b2-ci-wrap">
                <table className="b2-ci">
                  <thead><tr><th>Source</th><th className="num">Visits</th><th className="num">Next step</th><th className="num">Survey</th><th className="num">Email</th></tr></thead>
                  <tbody>
                    {funnel.sources.map((s) => (
                      <tr key={s.source}>
                        <td className="b2-ci-name">{s.source}</td>
                        <td className="num">{s.visits}</td>
                        <td className="num">{s.clicked} ({s.visits ? Math.round((s.clicked / s.visits) * 100) : 0}%)</td>
                        <td className="num">{s.survey}</td>
                        <td className="num">{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="b2-fine">
                Add <code>?src=instagram</code> to the link you post, one per platform, and each gets
                its own row. <code>supervised</code> is the one to use when you sit with someone, so
                the five-user bet never mixes with social traffic.
              </p>
            </>
          )}

          {funnel.labels.length > 0 && (
            <>
              <h4 className="b2-resp-h4" style={{ marginTop: 22 }}>What they opened</h4>
              <ul className="b2-bars">
                {funnel.labels.map(([l, n]) => (
                  <li key={l} className="b2-bar">
                    <span className="b2-bar-name">{l}</span>
                    <span className="b2-bar-track">
                      <span className="b2-bar-fill" style={{ width: `${Math.max((n / funnel.labels[0][1]) * 100, 3)}%` }} />
                    </span>
                    <span className="b2-bar-pct">{n}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="b3-notes">
        <h3 className="b2-h3">What is a placeholder here</h3>
        <ul>
          <li>The <b>$300</b> is the same assumed value we used in Bets #1 and #2. It is not a costed number.</li>
          <li>There is <b>no price</b> on it, on purpose. Asking people what they would pay is a leading question, and the benefits are not final yet.</li>
          <li>The <b>three benefits</b> come straight from the survey. Second and third place are close, so expect them to move.</li>
          <li>The <b>bullet points</b> under each benefit describe what a member would get in plain words. They still need real limits from KP.</li>
        </ul>
        <div className="b3-links">
          <Link className="btn sm" to="/present/bet3">Present this week&rsquo;s update</Link>
          <Link className="btn ghost sm" to="/bets/2">See the survey results behind this</Link>
        </div>
      </div>
    </div>
  )
}
