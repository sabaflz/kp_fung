import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isConfigured } from '../lib/supabase.js'
import { useFindings } from '../lib/findings.js'
import { BETS } from '../data/bets.js'
import { R2_BY_ID, analyzeResponses } from '../data/packages.js'
import BenefitIcon from '../components/BenefitIcon.jsx'

/* The page a partner lands on. It has to say where the project is today
   without anyone narrating, so the status is written by hand (NOW, below) and
   only the numbers are live. The old "current best guess" was computed from
   round 1 alone and could still show dental or vision after both were dropped. */

const NOW = [
  ['What we learned', 'Our first sessions showed the flyer read as a printed poster: people could not see there was a button to press. A layout problem, and one we could fix.', '/bets/3', 'Read Bet #3'],
  ['What we changed', 'Dental and vision are out. The flyer leads with everyday health, fits one screen, and every benefit can be tapped.', '/offer?test=1', 'See the flyer'],
  ['Testing now', 'A second survey round with seven benefits, and next a small paid ad that shows the flyer to people who have never met us.', '/present/nov20', 'This week\u2019s deck'],
]

function useRound2() {
  const [rows, setRows] = useState([])
  useEffect(() => {
    if (!isConfigured) return
    let alive = true
    supabase.from('bet2_responses').select('age, choices')
      .then(({ data, error }) => { if (alive && !error) setRows(data || []) })
    return () => { alive = false }
  }, [])
  return useMemo(() => ({ r1: analyzeResponses(rows, { round: 1 }), r2: analyzeResponses(rows, { round: 2 }) }), [rows])
}

export default function Goal() {
  const { counts } = useFindings()
  const { r1, r2 } = useRound2()

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="goal-hero">
        <div className="eyebrow">Our goal</div>
        <h1>Find the supplemental package 18 to 30 year olds would actually choose.</h1>
        <p className="lede">
          A student research project. Every interview, survey and bet feeds one question: which benefits, in what mix,
          would young adults pick for themselves. Nothing shown here is a real offer.
        </p>
      </div>

      <div>
        <div className="eyebrow">Where we are now</div>
        <div className="goal-now">
          {NOW.map(([k, text, to, label]) => (
            <div key={k} className="goal-now-card">
              <span className="goal-now-k">{k}</span>
              <p>{text}</p>
              {to.startsWith('/offer')
                ? <a className="btn ghost sm" href={to} target="_blank" rel="noreferrer">{label}</a>
                : <Link className="btn ghost sm" to={to}>{label}</Link>}
            </div>
          ))}
        </div>
      </div>

      <div className="goal-best card">
        <div className="hd">
          <h2>Round 2 of the choice survey, so far</h2>
          <span className="note">{r2.n} aged 18 to 30 · live</span>
        </div>
        <div className="bd">
          {r2.n === 0 ? (
            <div className="empty">No round 2 answers in range yet. Round 1 closed with {r1.n}.</div>
          ) : (
            <>
              <ul className="goal-r2">
                {r2.benefits.map((b) => (
                  <li key={b.id}>
                    <span className="goal-r2-name"><BenefitIcon name={R2_BY_ID[b.id].icon} size={15} />{R2_BY_ID[b.id].name}</span>
                    <span className="goal-r2-track">
                      <span className="goal-r2-fill" style={{ width: `${b.mean * 100}%` }} />
                      <span className="goal-r2-half" />
                    </span>
                    <span className="goal-r2-pct">{Math.round(b.mean * 100)}%</span>
                  </li>
                ))}
              </ul>
              <p className="b2-fine" style={{ margin: '12px 0 0' }}>
                How often a person picked the package with that benefit in it. The dashed line is a coin flip.
                {r2.n < 10 ? ` With ${r2.n} ${r2.n === 1 ? 'person' : 'people'} this is an early direction, not a ranking.` : ''}
              </p>
            </>
          )}
          <Link className="btn ghost sm" to="/bets/2" style={{ marginTop: 14 }}>Open the full results</Link>
        </div>
      </div>

      <div className="tiles">
        <div className="tile"><div className="n">{counts.interviews}</div><div className="l">interviews</div></div>
        <div className="tile"><div className="n">{r1.n}</div><div className="l">round 1 survey, aged 18 to 30</div></div>
        <div className="tile"><div className="n">{r2.n}</div><div className="l">round 2 survey, aged 18 to 30</div></div>
        <div className="tile"><div className="n">{BETS.length}</div><div className="l">bets run</div></div>
      </div>

      <div>
        <div className="eyebrow">How we got here</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 20, margin: '4px 0 10px' }}>The bets so far</h2>
        <div className="goal-bets">
          {BETS.map((b) => (
            <Link key={b.id} to={`/bets/${b.id}`} className="goal-bet">
              <span className="goal-bet-top">
                <span className="goal-bet-week">{b.week}</span>
                <span className={'goal-bet-status s-' + b.status.toLowerCase().replace(/\s+/g, '-')}>{b.status}</span>
              </span>
              <span className="goal-bet-title">{b.title}</span>
              <span className="goal-bet-sum">{b.summary}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
