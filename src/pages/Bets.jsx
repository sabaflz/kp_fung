import { Link } from 'react-router-dom'
import { BETS } from '../data/bets.js'
import { useFindings } from '../lib/findings.js'
import BetNav from '../components/BetNav.jsx'

/* The hub is a scannable index, not the whole story. Each card says where a
   bet stands in a couple of lines; the detail lives on the bet's own page. */

export default function Bets() {
  const { counts } = useFindings()

  return (
    <div className="grid" style={{ gap: 18 }}>
      <BetNav />

      <div className="bets-intro">
        <div>
          <div className="eyebrow">Journey</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
            Our bets
          </h1>
          <p className="lede" style={{ margin: 0 }}>
            Each week we place one small, testable bet and use what we learn to sharpen the package.
            The newest is on top. Open a bet for the full picture.
          </p>
        </div>
      </div>

      <div className="bet-list">
        {[...BETS].reverse().map((b) => {
          const headline = b.summary || b.learning || b.result || b.hypothesis
          return (
            <Link key={b.id} to={`/bets/${b.id}`} className="bet-card bet-card-link">
              <div className="bet-card-head">
                <span className="bet-week">{b.week}</span>
                <span className={'bet-status s-' + b.status.toLowerCase()}>{b.status}</span>
              </div>
              <h2 className="bet-title">{b.title}</h2>
              <p className="bet-sum">{headline}</p>
              {b.live && (
                <p className="bet-live-line">
                  {counts.bet} {counts.bet === 1 ? 'response' : 'responses'} so far, updating live.
                </p>
              )}
              <span className="bet-more">Open Bet #{b.id} &rarr;</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
