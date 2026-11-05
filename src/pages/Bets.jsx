import { Link } from 'react-router-dom'
import { BETS } from '../data/bets.js'
import { useFindings } from '../lib/findings.js'

export default function Bets() {
  const { counts } = useFindings()

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="bets-intro">
        <div>
          <div className="eyebrow">Journey</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
            Our bets
          </h1>
          <p className="lede" style={{ margin: 0 }}>Each week we place one small, testable bet and use what we learn to sharpen the package. The newest is on top.</p>
        </div>
        <Link className="btn sm bets-present" to="/present?s=0">&#9658; Present</Link>
      </div>

      <div className="bet-list">
        {[...BETS].reverse().map((b) => (
          <div key={b.id} className="bet-card">
            <div className="bet-card-head">
              <span className="bet-week">{b.week}</span>
              <span className={'bet-status s-' + b.status.toLowerCase()}>{b.status}</span>
            </div>
            <h2 className="bet-title">{b.title}</h2>

            <div className="bet-field"><span className="bet-k">Hypothesis</span><p>{b.hypothesis}</p></div>

            {b.live && (
              <div className="bet-field"><span className="bet-k">Live</span>
                <p>{counts.bet} {counts.bet === 1 ? 'response' : 'responses'} so far. Results update in real time.</p></div>
            )}
            {b.result && <div className="bet-field"><span className="bet-k">Result</span><p>{b.result}</p></div>}
            {b.learning && <div className="bet-field"><span className="bet-k">Key learning</span><p>{b.learning}</p></div>}

            {b.links?.length > 0 && (
              <div className="bet-links">
                {b.links.map((l) =>
                  l.external
                    ? <a key={l.to} className="btn ghost sm" href={l.to} target="_blank" rel="noreferrer">{l.label}</a>
                    : <Link key={l.to} className="btn ghost sm" to={l.to}>{l.label}</Link>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="bet-card bet-next">
          <div className="bet-card-head"><span className="bet-week">Next</span></div>
          <h2 className="bet-title">Bet #3, coming up</h2>
          <p className="lede" style={{ margin: 0 }}>Once Bet #2 names the winning benefits, the next bet tests the details and whether people would enroll.</p>
        </div>
      </div>
    </div>
  )
}
