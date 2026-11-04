import { Link } from 'react-router-dom'
import { useFindings } from '../lib/findings.js'
import { BETS } from '../data/bets.js'
import BenefitIcon from '../components/BenefitIcon.jsx'

export default function Goal() {
  const { bestPackage, counts, hasAny } = useFindings()

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="goal-hero">
        <div className="eyebrow">Our goal</div>
        <h1>Find the supplemental package 18 to 30 year olds would actually choose.</h1>
        <p className="lede">
          Every interview, survey, and bet feeds one question: which benefits, in what mix, at $300 a year, would young adults pick
          for themselves. This is where that picture comes together.
        </p>
      </div>

      <div className="goal-best card">
        <div className="hd"><h2>Current best guess</h2><span className="note">updates as data grows</span></div>
        <div className="bd">
          {hasAny ? (
            <div className="goal-best-chips">
              {bestPackage.map((b) => (
                <span key={b.id} className="fo-chip"><BenefitIcon name={b.icon} size={16} />{b.name}</span>
              ))}
            </div>
          ) : (
            <div className="empty">No data yet. Run interviews and share the survey to start the picture.</div>
          )}
          <Link className="btn ghost sm" to="/findings" style={{ marginTop: 14 }}>See how we got here</Link>
        </div>
      </div>

      <div className="tiles">
        <div className="tile"><div className="n">{counts.interviews}</div><div className="l">interviews</div></div>
        <div className="tile"><div className="n">{counts.survey}</div><div className="l">survey responses</div></div>
        <div className="tile"><div className="n">{counts.bet}</div><div className="l">choice-test responses</div></div>
        <div className="tile"><div className="n">{BETS.length}</div><div className="l">bets run</div></div>
      </div>

      <div>
        <div className="eyebrow">Where we are</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 20, margin: '4px 0 10px' }}>The bets so far</h2>
        <div className="goal-bets">
          {BETS.map((b) => (
            <Link key={b.id} to="/bets" className="goal-bet">
              <span className="goal-bet-top">
                <span className="goal-bet-week">{b.week}</span>
                <span className={'goal-bet-status s-' + b.status.toLowerCase()}>{b.status}</span>
              </span>
              <span className="goal-bet-title">{b.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
