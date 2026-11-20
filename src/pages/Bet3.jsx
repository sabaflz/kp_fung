import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase, isConfigured } from '../lib/supabase.js'
import { copyText, useToast } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { isOwner, isViewer } from '../lib/team.js'
import { BETS_BY_ID } from '../data/bets.js'

const BET3 = BETS_BY_ID[3]
import { BENEFIT_BY_ID, SURVEY_BENEFITS, analyzeResponses } from '../data/packages.js'
import BenefitIcon from '../components/BenefitIcon.jsx'

/* Bet #3: a concept flyer for the package the survey is pointing at.

   The three benefits on the flyer are NOT typed in. They are whichever three
   are leading the Bet #2 survey right now, so the flyer follows the evidence
   as more responses arrive. There is deliberately no price on it: Bet #3 is
   about making the benefits specific, not about what people would pay. */

// How each benefit reads on a flyer. Written to answer the comprehension
// problem from Bet #1: say exactly what you get, in plain words.
export const FLYER_COPY = {
  everyday: {
    kicker: 'Everyday health',
    line: 'What insurance skips.',
    points: ['Cold, allergy and pain relief', 'Sunscreen, first aid and vitamins', 'Order online or pick up in store'],
  },
  mental: {
    kicker: 'Mental wellbeing',
    line: 'Stress, sleep, someone to talk to.',
    points: ['Meditation and mindfulness apps', 'Coaching for stress, career and life changes', 'Sleep support and counseling sessions'],
  },
  fitness: {
    kicker: 'Physical wellbeing',
    line: 'Move more, hurt less.',
    points: ['Gym memberships, yoga and dance classes', 'Race entries, sports leagues and fitness apps', 'Sports massage, stretching and physical therapy'],
  },
  pt: {
    kicker: 'Physical therapy',
    line: 'Recover properly.',
    points: ['Visits with a physical therapist', 'For an injury, ongoing pain or recovery', 'A plan you can keep up at home'],
  },
  transport: {
    kicker: 'Rides to care',
    line: 'A ride when you need one.',
    points: ['To and from appointments', 'To the pharmacy or urgent care', 'Booked from your phone'],
  },
  derm: {
    kicker: 'Skin care',
    line: 'See a dermatologist.',
    points: ['A visit for acne, a rash or a skin check', 'Money toward treatment', 'In person or by video'],
  },
  nutrition: {
    kicker: 'Nutrition',
    line: 'Your own dietitian.',
    points: ['One-on-one sessions with a registered dietitian', 'A plan built around how you actually eat', 'By video, on your schedule'],
  },
  // Round 1 only. Not shown on the flyer any more: both come with most plans.
  dental: {
    kicker: 'Dental',
    line: 'Cleanings and fillings.',
    points: ['Two cleanings and X-rays a year', 'Money toward fillings and other dental work', 'See a dentist near you'],
  },
  vision: {
    kicker: 'Vision',
    line: 'Exams and glasses.',
    points: ['A yearly eye exam', 'Money toward glasses or contacts', 'Pick the frames you actually like'],
  },
}

/* What the flyer shows, in this order, for everyone.

   Fixed on purpose. Round 1 of the survey put dental first, and our partners
   pointed out that dental and vision come with most plans, so they would not
   set an offer apart. Everyday health is the idea they singled out, so it
   leads. Mental and physical wellbeing follow their recommendation and the
   round 1 ranking of what is left. It does not move with live data, because
   five people in one test all have to see the same flyer. */
export const FLYER_TOP = ['everyday', 'mental', 'fitness']
export const DEFAULT_TOP = FLYER_TOP

// Median is the honest middle for timings: one person who leaves the tab
// open for an hour would wreck a mean.
function median(xs) {
  if (!xs.length) return null
  const a = [...xs].sort((x, y) => x - y)
  const m = Math.floor(a.length / 2)
  return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2)
}
const secs = (ms) => (ms == null ? '—' : ms < 1000 ? '<1s' : Math.round(ms / 1000) + 's')

/* The flyer itself, shared by the team's Bet #3 page (printed, so the link
   is written out) and the public /offer page (on a screen, so the call to
   action is a real button passed in as `cta`). */
export function FlyerSheet({ top, surveyUrl = '', cta = null, onBenefit = null }) {
  return (
    <article className="fl-page">
      <div className="fl-concept">This benefit does not exist. It is a research concept, not an offer.</div>

      <header className="fl-hero">
        <p className="fl-eyebrow">Extra benefits for the life you actually have</p>
        <h2 className="fl-h1">$300 a year.<br />Spend it your way.</h2>
        <p className="fl-sub">
          One allowance on top of your health plan, for the everyday things it usually
          leaves out. You decide how to split it.
        </p>
      </header>

      <section className="fl-benefits">
        {top.map((id) => {
          const c = FLYER_COPY[id]
          const inner = (
            <>
              <span className="fl-ico"><BenefitIcon name={BENEFIT_BY_ID[id].icon} size={26} /></span>
              <h3>{c.kicker}</h3>
              <p className="fl-line">{c.line}</p>
              <ul>{c.points.map((p) => <li key={p}>{p}</li>)}</ul>
              {onBenefit && <span className="fl-benefit-more">See what is included <span aria-hidden="true">&rarr;</span></span>}
            </>
          )
          // On screen every benefit is its own way in, so the page offers four
          // things to press rather than one button under a wall of text.
          return onBenefit
            ? <button key={id} type="button" className="fl-benefit fl-benefit-btn" onClick={(e) => onBenefit(id, e)}>{inner}</button>
            : <div key={id} className="fl-benefit">{inner}</div>
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
          <b>Curious what $300 could cover for you?</b>
          <span>
            See what is included and tell us what you would want
            {cta && surveyUrl ? <span className="fl-print-only"> at <u>{surveyUrl}</u></span> : null}
            {!cta && surveyUrl ? <> at <u>{surveyUrl}</u></> : null}
            {cta && !surveyUrl ? '.' : null}
          </span>
        </div>
        {cta}
      </section>

      <footer className="fl-foot">
        <p>The $300 allowance and everything inside it are placeholders used for research. Nothing here has been priced or approved.</p>
        <p>Made by a student research team at UC Berkeley. No health insurer is offering this, and nothing here is an offer of coverage. If enough people tell us they want something like this, that is the case we will put to the people who design health plans.</p>
      </footer>
    </article>
  )
}

export default function Bet3() {
  const [rows, setRows] = useState([])
  const [events, setEvents] = useState([])
  // null means we could not read the interest list: either the table is not
  // there yet, or this account is a read-only viewer, who is blocked from
  // respondent emails by design.
  const [followups, setFollowups] = useState(null)
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
    // Emails live in bet2_followups, not in the event log: somebody who leaves
    // one at the end of the survey never fires a landing-page event, so
    // counting events alone undercounts the interest list.
    const fu = await supabase.from('bet2_followups')
      .select('created_at, email, top_benefit, source, wants_results')
      .order('created_at', { ascending: false })
    setFollowups(fu.error ? null : (fu.data || []))
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
  const top = FLYER_TOP
  const { session } = useAuth()
  const owner = isOwner(session?.user?.email || '')
  const readOnly = isViewer(session?.user?.email || '')
  const toast = useToast()

  // The interest list: everyone who actually left an address, wherever they
  // left it. This is the authoritative count, and the funnel defers to it.
  const interest = useMemo(() => {
    if (!followups) return null
    const list = followups.filter((f) => (f.email || '').trim())
    const bySource = {}
    for (const f of list) bySource[f.source || 'unknown'] = (bySource[f.source || 'unknown'] || 0) + 1
    return { list, count: list.length, bySource, keen: followups.filter((f) => f.wants_results).length }
  }, [followups])

  // The Bet #3 funnel. Each visit counts once per step, so somebody who
  // opens three sections is still one visitor who took a next step.
  const funnel = useMemo(() => {
    if (!events.length) return null
    const bySession = {}
    // Flyer page events are a different step (flyer to landing page), so
    // they are counted on their own and never as landing-page visits.
    const flyerBy = {}
    for (const e of events) {
      if (e.event === 'flyer' || e.event === 'flyer_click') {
        const f = (flyerBy[e.session] ||= { source: e.source || 'direct', ms: null })
        if (e.source) f.source = e.source
        if (e.event === 'flyer_click' && (f.ms == null || (e.ms != null && e.ms < f.ms))) f.ms = e.ms ?? 0
        continue
      }
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
    const flyerSrc = {}
    for (const f of Object.values(flyerBy)) {
      const g = (flyerSrc[f.source] ||= { source: f.source, saw: 0, clicked: 0, within60: 0, times: [] })
      g.saw++
      if (f.ms != null) { g.clicked++; g.times.push(f.ms); if (f.ms <= 60000) g.within60++ }
    }
    return {
      flyer: Object.values(flyerSrc).sort((a, b) => b.saw - a.saw),
      visits: visits.length,
      clicked: clicked.length,
      survey: visits.filter((v) => v.survey).length,
      emailEvents: visits.filter((v) => v.email).length,
      clickRate: visits.length ? clicked.length / visits.length : 0,
      medianMs: median(clicked.map((v) => v.firstMs).filter((x) => x != null)),
      within60: clicked.filter((v) => v.firstMs != null && v.firstMs <= 60000).length,
      sources: Object.values(bySource).sort((a, b) => b.visits - a.visits),
      labels: Object.entries(labels).sort((a, b) => b[1] - a[1]),
    }
  }, [events])

  // What the page shows for emails. The interest list wins when we can read it.
  const emailCount = interest ? interest.count : funnel?.emailEvents ?? 0
  // Per source, the same preference: the interest list first, the event log
  // only when the list is not readable.
  const srcEmail = (s) => (interest ? (interest.bySource[s.source] || 0) : s.email)

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
  // Full address for links the team copies and sends.
  const siteOrigin = import.meta.env.VITE_SITE_URL
    ? 'https://' + import.meta.env.VITE_SITE_URL
    : (typeof window !== 'undefined' ? window.location.origin : '')

  return (
    <div className="b3">
      {/* What we learned and fixed leads; the bar and the count follow in plain words. */}
      <div className="b3-result">
        <div className="b3-result-body">
          <h3>What we learned, and what we changed</h3>
          <p>{BET3.learning}</p>
          <h3>For the record</h3>
          <p>{BET3.result}</p>
          <div className="b3-try-row" style={{ marginTop: 4 }}>
            <Link className="btn sm" to="/present/nov20">Present this update</Link>
            <a className="btn ghost sm" href="/offer?test=1" target="_blank" rel="noreferrer">See the flyer as a participant does</a>
          </div>
        </div>
      </div>

      <div className="b3-bar">
        <div className="b3-evidence">
          <b>The flyer shows a fixed three, everyday health first.</b> Round 1 of the survey put dental
          on top, and our partners pointed out that dental and vision come with most plans, so they
          would not set an offer apart. The flyer now leads with the idea they singled out, followed by
          mental and physical wellbeing. It stays fixed so every participant sees the same thing.
          The public version is at <code>/offer</code>.
        </div>
        <div className="b3-controls">
          <button type="button" className="btn sm" onClick={() => window.print()}>Print or save as PDF</button>
        </div>
      </div>

      {/* Everything a participant will see, openable without recording anything. */}
      {!readOnly && (
      <div className="b3-notes b3-try">
        <h3 className="b2-h3">See it and test it</h3>
        <p className="b2-desc" style={{ marginBottom: 14 }}>
          These open exactly what a participant sees. A test run records nothing: no click, no survey
          response, no email. The flyer is shown below, and the survey&rsquo;s current benefits are listed here.
        </p>
        <div className="b3-try-row">
          <a className="btn sm" href="/offer?test=1" target="_blank" rel="noreferrer">Test the flyer</a>
          <a className="btn ghost sm" href="/plan?test=1" target="_blank" rel="noreferrer">Test the page behind it</a>
          <a className="btn ghost sm" href="/packages?test=1" target="_blank" rel="noreferrer">Test the survey</a>
        </div>

        <h4 className="b2-resp-h4" style={{ marginTop: 20 }}>Links for the supervised sessions</h4>
        <div className="b2-ci-wrap">
          <table className="b2-ci">
            <thead><tr><th>Who</th><th>Link to open on the participant&rsquo;s screen</th><th></th></tr></thead>
            <tbody>
              {['saba', 'derek', 'allie'].map((who) => {
                const link = `${siteOrigin}/offer?src=interview-${who}`
                return (
                  <tr key={who}>
                    <td className="b2-ci-name" style={{ textTransform: 'capitalize' }}>{who}</td>
                    <td><code style={{ overflowWrap: 'anywhere' }}>{link}</code></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button type="button" className="btn ghost sm" onClick={async () => toast((await copyText(link)) ? 'Link copied' : 'Copy failed')}>Copy</button>{' '}
                      <a className="btn ghost sm" href={`/offer?src=interview-${who}&test=1`} target="_blank" rel="noreferrer">Test it</a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="b2-fine">
          <b>Copy</b> gives the real link, which records. <b>Test it</b> opens the same link as a test run, so
          you can check it works before sending it. Each person&rsquo;s sessions appear under their own name in
          the table further down.
        </p>

        <h4 className="b2-resp-h4" style={{ marginTop: 20 }}>What the survey asks now (round 2)</h4>
        <ul className="b3-survey-list">
          {SURVEY_BENEFITS.map((b) => (
            <li key={b.id}>
              <span className="lp-list-ico"><BenefitIcon name={b.icon} size={16} /></span>
              <span><b>{b.name}.</b> {b.blurb}</span>
            </li>
          ))}
        </ul>
        <p className="b2-fine">Ten screens, two packages of three each time. Dental and vision are no longer offered.</p>
      </div>
      )}

      <div className="fl-scroll">
        {/* Same flyer people see at /offer. The button and the benefits open
            a test run in a new tab, so trying them here records nothing.
            Printed, the button gives way to the written-out link. */}
        <FlyerSheet
          top={top}
          surveyUrl={surveyUrl}
          onBenefit={() => window.open('/offer?test=1', '_blank', 'noopener')}
          cta={
            <a className="fl-cta-btn" href="/offer?test=1" target="_blank" rel="noreferrer">
              See what is included <span aria-hidden="true">&rarr;</span>
            </a>
          }
        />
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
                  `${funnel.survey} started the survey, ${emailCount} left an email`,
                  funnel.medianMs != null ? `Median time to first click: ${secs(funnel.medianMs)}` : '',
                  '', 'By source:',
                  ...funnel.sources.map((s) => `  ${s.source}: ${s.visits} visits, ${s.clicked} clicked, ${s.survey} survey, ${srcEmail(s)} email`),
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

          {interest && interest.count > 0 && (
            <details className="b3-list">
              <summary>
                Interest list: {interest.count} {interest.count === 1 ? 'email' : 'emails'}
                {interest.keen > interest.count && ` (${interest.keen - interest.count} said yes without leaving one)`}
              </summary>
              <div className="b2-ci-wrap">
                <table className="b2-ci">
                  <thead><tr><th>Email</th><th>Left</th><th>Their top benefit</th><th>Source</th></tr></thead>
                  <tbody>
                    {interest.list.map((f, i) => (
                      <tr key={f.email + i}>
                        <td className="b2-ci-name"><a href={`mailto:${f.email}`}>{f.email}</a></td>
                        <td>{f.created_at ? new Date(f.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}</td>
                        <td>{f.top_benefit || ''}</td>
                        <td>{f.source || 'unknown'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="b2-fine">
                These people were told a student research team would send them results. Nothing goes to
                anyone outside the team unless the survey says so first. Rows left before Nov 17 have no
                source recorded, so they show as unknown.
              </p>
            </details>
          )}
          {!interest && (
            <p className="b2-fine" style={{ marginBottom: 14 }}>
              The interest list is not readable from this account, so the email count below comes from the
              page&rsquo;s own event log and misses anyone who left an address at the end of the survey.
            </p>
          )}

          <div className="b3-funnel">
            {[
              ['Saw the page', funnel.visits, null],
              ['Took a next step', funnel.clicked, funnel.visits],
              ['Started the survey', funnel.survey, funnel.visits],
              ['Left an email', emailCount, funnel.visits],
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

          {funnel.flyer.length > 0 && (
            <>
              <h4 className="b2-resp-h4" style={{ marginTop: 22 }}>From the flyer to the page</h4>
              <div className="b2-ci-wrap">
                <table className="b2-ci">
                  <thead><tr><th>Source</th><th className="num">Saw the flyer</th><th className="num">Clicked through</th><th className="num">Within a minute</th><th>Time to click</th></tr></thead>
                  <tbody>
                    {funnel.flyer.map((f) => (
                      <tr key={f.source}>
                        <td className="b2-ci-name">{f.source}</td>
                        <td className="num">{f.saw}</td>
                        <td className="num">{f.clicked}</td>
                        <td className="num">{f.within60}</td>
                        <td>{f.times.length ? f.times.slice().sort((x, y) => x - y).map(secs).join(', ') : 'no click'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="b2-fine">
                This is the step Bet #3&rsquo;s 4-of-5 bar judges. For a supervised session, open{' '}
                <code>/offer?src=interview-yourname</code> on the participant&rsquo;s screen and say nothing.
                The clock starts when the flyer loads and stops when they press the button.
              </p>
            </>
          )}

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
                        <td className="num">{srcEmail(s)}</td>
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
          <li>The <b>three benefits</b> are fixed for now: everyday health first, then mental and physical wellbeing. The survey decides what else joins them.</li>
          <li>The <b>bullet points</b> under each benefit describe what a member would get in plain words. They still need real limits from KP.</li>
        </ul>
        <div className="b3-links">
          <Link className="btn sm" to="/present/nov20">Present the Nov 20 partner update</Link>
          <Link className="btn ghost sm" to="/presentations">All presentations</Link>
          <Link className="btn ghost sm" to="/bets/2">See the survey results behind this</Link>
        </div>
      </div>
    </div>
  )
}
