import { useMemo, useState } from 'react'
import { supabase, isConfigured } from '../lib/supabase.js'
import { BENEFITS, BENEFIT_BY_ID, buildSession, newRespondentId, tallyResponses } from '../data/packages.js'
import BenefitIcon from '../components/BenefitIcon.jsx'

const Icon = ({ name }) => <BenefitIcon name={name} />

const AGE_RANGES = ['Under 18', '18–20', '21–23', '24–26', '27–30', 'Over 30']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Package({ side, ids, onPick }) {
  return (
    <button type="button" className="pk-card" onClick={() => onPick(side)}>
      <div className="pk-card-top">
        <span className="pk-price">$300 a year</span>
      </div>
      <ul className="pk-list">
        {ids.map((id) => {
          const b = BENEFIT_BY_ID[id]
          return (
            <li key={id}>
              <span className="pk-ico"><Icon name={b.icon} /></span>
              <span className="pk-text"><b>{b.name}</b><span>{b.blurb}</span></span>
            </li>
          )
        })}
      </ul>
      <span className="pk-choose">Choose this one</span>
    </button>
  )
}

/* `preview` is the owner-only test run: the exact same survey, but nothing is
   ever written. Both save paths return early, so a test can never land in the
   results, whatever the tester clicks. */
export default function Packages({ preview = false, onRestart, onExit }) {
  const session = useMemo(() => buildSession(), [])
  const respondent = useMemo(() => newRespondentId(), [])
  const [stage, setStage] = useState('intro') // intro | age | q | done
  const [age, setAge] = useState('')
  const [i, setI] = useState(0)
  const [choices, setChoices] = useState([])
  const [saving, setSaving] = useState(false)

  // Closing ask: are they interested in hearing more, and if so, their email.
  // Interest is the signal; the email is what makes it actionable.
  const [interest, setInterest] = useState('') // '' | 'yes' | 'no'
  const [email, setEmail] = useState('')
  const [fu, setFu] = useState('open') // open | saving | sent | skipped
  const [fuErr, setFuErr] = useState('')
  const [fuSentEmail, setFuSentEmail] = useState(false)
  const [fuKeen, setFuKeen] = useState(false)

  const total = session.length

  // The respondent's own result, computed from just their 10 choices (client-side,
  // so it always shows even if the database save is unavailable).
  const mine = useMemo(() => (choices.length ? tallyResponses([{ choices }]) : null), [choices])
  const topName = mine?.ranking?.length ? BENEFIT_BY_ID[mine.ranking[0].id].name : ''

  async function submit(all) {
    if (preview) return // test run: never saved
    if (!isConfigured) {
      // No Supabase keys on this build: the response can't be stored. Flag it in
      // the console so the team can see why results are not appearing.
      console.warn('[survey] Supabase not configured — response was NOT saved. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }
    try {
      let { error } = await supabase.from('bet2_responses').insert({ respondent, age, choices: all })
      // If the table predates the age column, don't lose the response — save it without age.
      if (error && /age/i.test(error.message || '')) {
        console.warn('[survey] age column missing — run supabase_bet2_survey.sql. Saving without age for now.')
        ;({ error } = await supabase.from('bet2_responses').insert({ respondent, choices: all }))
      }
      if (error) console.error('[survey] save failed:', error.message)
    } catch (e) {
      console.error('[survey] save threw:', e?.message || e)
    }
  }

  // Saved separately from the picks, in bet2_followups, so an email address is
  // never stored in the same row as someone's answers.
  async function sendFollowup({ interested } = {}) {
    // `interested` is passed in rather than read from state, because the "no
    // thanks" button sets it and submits in the same click, and a state update
    // would not land before this runs.
    const keen = interested != null ? interested : interest === 'yes'
    const em = keen ? email.trim() : ''
    if (em && !EMAIL_RE.test(em)) { setFuErr('That does not look like an email address.'); return }
    setFuErr(''); setFu('saving')
    if (preview) {
      // test run: show the same confirmation, write nothing
    } else if (isConfigured) {
      try {
        const { error } = await supabase.from('bet2_followups').insert({
          respondent,
          email: em || null,
          top_benefit: topName || null,
          enabler: null, // retired: the old "what would make you use it" question
          wants_results: keen, // said yes to hearing more, with or without an email
        })
        if (error) console.error('[survey] follow-up save failed:', error.message)
      } catch (e) {
        console.error('[survey] follow-up save threw:', e?.message || e)
      }
    } else {
      console.warn('[survey] Supabase not configured — follow-up was NOT saved.')
    }
    // Either way the person is done, so never show them a failure for this.
    setFuSentEmail(!!em)
    setFuKeen(keen)
    setFu('sent')
  }

  function pick(side) {
    const scr = session[i]
    const chosenIds = side === 'right' ? scr.right : scr.left
    const record = { left: scr.left, right: scr.right, chosen: side, chosenIds }
    const all = [...choices, record]
    setChoices(all)
    if (i + 1 < total) {
      setI(i + 1)
    } else {
      setStage('done')
      setSaving(true)
      submit(all).finally(() => setSaving(false))
    }
  }

  return (
    <div className={'pk-root' + (preview ? ' pk-preview' : '')}>
      {preview && (
        <div className="pk-testbar" role="status">
          <span><b>Test run.</b> This is the real survey, but nothing you do here is saved.</span>
          <span className="pk-testbar-actions">
            <button type="button" onClick={onRestart}>Start over</button>
            <button type="button" onClick={onExit}>Back to the app</button>
          </span>
        </div>
      )}
      <div className="pk-shell">
        {stage === 'intro' && (
          <div className="pk-panel pk-intro">
            <span className="pk-eyebrow">2 minute choice survey</span>
            <h1>Which health benefits would you actually want?</h1>
            <p className="pk-lead">
              Imagine your health plan came with an extra wellness benefit worth about <b>$300 a year</b>.
              It does not replace your insurance, it just adds coverage for the things below.
            </p>
            <p className="pk-lead">
              We will show you two versions, 10 times. They always cost the same, so you are only
              choosing which mix of benefits you would rather have. Pick whichever feels more useful to you.
            </p>
            <div className="pk-benefit-key">
              {BENEFITS.map((b) => (
                <div key={b.id} className="pk-keyrow">
                  <span className="pk-ico"><Icon name={b.icon} /></span>
                  <span className="pk-text"><b>{b.name}</b><span>{b.blurb}</span></span>
                </div>
              ))}
            </div>
            <button type="button" className="pk-start" onClick={() => setStage('age')}>Start</button>
            <p className="pk-fine">
              Your picks are anonymous and there is no sign-in. At the end you can choose to leave
              an email if you are interested in a package like this, but you do not have to.
            </p>
          </div>
        )}

        {stage === 'age' && (
          <div className="pk-panel">
            <span className="pk-eyebrow">One quick question first</span>
            <h2 className="pk-prompt">How old are you?</h2>
            <p className="pk-sub">This just lets us group the answers. Nothing here identifies you.</p>
            <div className="pk-age-grid">
              {AGE_RANGES.map((a) => (
                <button key={a} type="button" className="pk-age-btn" onClick={() => { setAge(a); setStage('q') }}>{a}</button>
              ))}
            </div>
          </div>
        )}

        {stage === 'q' && (
          <div className="pk-panel">
            <div className="pk-progress">
              <div className="pk-progress-bar"><span style={{ width: `${(i / total) * 100}%` }} /></div>
              <span className="pk-progress-label">Question {i + 1} of {total}</span>
            </div>
            <h2 className="pk-prompt">Which package would you rather have?</h2>
            <p className="pk-sub">Both cost the same $300 a year. Tap the one you would pick.</p>
            <div className="pk-grid">
              <Package side="left" ids={session[i].left} onPick={pick} />
              <div className="pk-vs">or</div>
              <Package side="right" ids={session[i].right} onPick={pick} />
            </div>
          </div>
        )}

        {stage === 'done' && (
          <div className="pk-panel pk-done">
            <div className="pk-check">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <h1>Thank you</h1>

            {mine && mine.ranking.length > 0 && (
              <>
                <p className="pk-lead pk-result-lead">
                  Based on the 10 choices you just made, it looks like
                  {' '}<b>{BENEFIT_BY_ID[mine.ranking[0].id].name.toLowerCase()}</b> matters most to you.
                </p>

                <div className="pk-result">
                  <div className="pk-result-head">Your ideal package</div>
                  <div className="pk-result-chips">
                    {mine.ranking.slice(0, 3).map((r) => (
                      <span key={r.id} className="pk-result-chip">
                        <BenefitIcon name={BENEFIT_BY_ID[r.id].icon} size={16} />
                        {BENEFIT_BY_ID[r.id].name}
                      </span>
                    ))}
                  </div>

                  <div className="pk-result-head pk-result-head-2">How often you picked each benefit</div>
                  <ul className="pk-result-bars">
                    {mine.ranking.map((r) => {
                      const b = BENEFIT_BY_ID[r.id]
                      const pct = Math.round(r.rate * 100)
                      return (
                        <li key={r.id} className="pk-result-bar">
                          <span className="pk-result-name"><BenefitIcon name={b.icon} size={15} />{b.name}</span>
                          <span className="pk-result-track"><span className="pk-result-fill" style={{ width: `${Math.max(pct, 3)}%` }} /></span>
                          <span className="pk-result-pct">{pct}%</span>
                        </li>
                      )
                    })}
                  </ul>
                  <p className="pk-fine pk-result-fine">Out of 10 head-to-head choices, how often each benefit was in the package you picked.</p>
                </div>
              </>
            )}

            {fu === 'sent' && (
              <div className="pk-fu pk-fu-sent">
                <p>
                  {fuSentEmail
                    ? 'Got it, you are on the list. We will send you more about the plan, and your results.'
                    : fuKeen
                      ? 'Noted, thanks. Without an email we cannot send you anything, but your interest is recorded.'
                      : 'Thanks, that helps. That is everything, you can close this tab.'}
                </p>
              </div>
            )}

            {fu === 'skipped' && (
              <p className="pk-lead" style={{ marginTop: 18 }}>That is everything. Thanks for helping, you can close this tab.</p>
            )}

            {(fu === 'open' || fu === 'saving') && (
              <div className="pk-fu">
                <div className="pk-fu-head">Before you go</div>
                <p className="pk-fu-q">Want to hear more about a plan like this?</p>
                <p className="pk-fu-note">
                  We are students researching this with Kaiser Permanente. Nothing here is for sale,
                  and this plan does not exist yet.
                </p>

                <div className="pk-fu-opts">
                  <button
                    type="button"
                    className="pk-fu-opt"
                    aria-pressed={interest === 'yes'}
                    onClick={() => setInterest('yes')}
                  >
                    <span className="pk-fu-dot" aria-hidden="true" />
                    <span>Yes, send me more about it</span>
                  </button>
                  <button
                    type="button"
                    className="pk-fu-opt"
                    aria-pressed={interest === 'no'}
                    onClick={() => { setInterest('no'); setEmail(''); setFuErr('') }}
                  >
                    <span className="pk-fu-dot" aria-hidden="true" />
                    <span>No thanks</span>
                  </button>
                </div>

                {interest === 'yes' && (
                  <div className="pk-fu-email">
                    <label className="pk-fu-label" htmlFor="pk-email">Where should we send it?</label>
                    <p className="pk-fu-note">
                      We will send you more about the plan as it takes shape, and your own results from
                      above. Leaving your email means it gets stored alongside your picks. We will not
                      use it for anything else, and you can ask us to delete it at any time.
                    </p>
                    <input
                      id="pk-email"
                      className="pk-fu-input"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (fuErr) setFuErr('') }}
                    />
                    {fuErr && <p className="pk-fu-err">{fuErr}</p>}
                  </div>
                )}

                {interest !== '' && (
                  <div className="pk-fu-actions">
                    <button
                      type="button"
                      className="pk-fu-send"
                      disabled={fu === 'saving'}
                      onClick={() => sendFollowup()}
                    >
                      {fu === 'saving' ? 'Sending…' : 'Done'}
                    </button>
                    {interest === 'yes' && (
                      <span className="pk-fu-hint">You can leave the email blank if you would rather not.</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {saving && <p className="pk-fine">Saving your responses…</p>}
          </div>
        )}
      </div>
    </div>
  )
}
