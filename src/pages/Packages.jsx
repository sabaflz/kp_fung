import { useMemo, useState } from 'react'
import { supabase, isConfigured } from '../lib/supabase.js'
import { BENEFITS, BENEFIT_BY_ID, buildSession, newRespondentId } from '../data/packages.js'
import BenefitIcon from '../components/BenefitIcon.jsx'

const Icon = ({ name }) => <BenefitIcon name={name} />

const AGE_RANGES = ['Under 18', '18–20', '21–23', '24–26', '27–30', 'Over 30']

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

export default function Packages() {
  const session = useMemo(() => buildSession(), [])
  const respondent = useMemo(() => newRespondentId(), [])
  const [stage, setStage] = useState('intro') // intro | age | q | done
  const [age, setAge] = useState('')
  const [i, setI] = useState(0)
  const [choices, setChoices] = useState([])
  const [saving, setSaving] = useState(false)

  const total = session.length

  async function submit(all) {
    if (!isConfigured) return // local preview without keys: skip save
    try {
      await supabase.from('bet2_responses').insert({
        respondent,
        age,
        choices: all,
      })
    } catch { /* best-effort: never block the thank-you screen */ }
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
    <div className="pk-root">
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
            <p className="pk-fine">Anonymous. No sign-in, no personal information collected.</p>
          </div>
        )}

        {stage === 'age' && (
          <div className="pk-panel">
            <span className="pk-eyebrow">One quick question first</span>
            <h2 className="pk-prompt">How old are you?</h2>
            <p className="pk-sub">This just lets us group the answers. We do not collect anything else about you.</p>
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
            <p className="pk-lead">Your choices were recorded. That is everything, you can close this tab.</p>
            {saving && <p className="pk-fine">Saving your responses…</p>}
          </div>
        )}
      </div>
    </div>
  )
}
