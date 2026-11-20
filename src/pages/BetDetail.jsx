import { Link, Navigate, useParams } from 'react-router-dom'
import { BETS } from '../data/bets.js'
import { DECKS } from '../decks/index.js'
import BetNav from '../components/BetNav.jsx'
import Bet2 from './Bet2.jsx'
import Bet3 from './Bet3.jsx'

/* One route for every bet. The header comes from the BETS data, so a bet with
   nothing custom still gets a real page. Bets that have their own body (the
   live Bet #2 results, the Bet #3 flyer) render it underneath. */

const BODIES = { 2: Bet2, 3: Bet3 }

const STATUS_CLASS = {
  supported: 'bp-ok',
  collecting: 'bp-live',
}

export default function BetDetail() {
  const { id } = useParams()
  const betId = Number(id)
  const bet = BETS.find((b) => b.id === betId)
  if (!bet) return <Navigate to="/bets" replace />

  const Body = BODIES[betId]
  const deck = DECKS['bet' + betId]

  return (
    <div className="grid" style={{ gap: 20 }}>
      <BetNav current={betId} />

      <div className="bp-top">
        <span className="bp-eyebrow">
          {bet.week} <span className="bp-dot">·</span>{' '}
          <span className={STATUS_CLASS[bet.status.toLowerCase()] || ''}>{bet.status}</span>
        </span>
        <h1 className="bp-title">{bet.title}</h1>
        <p className="bp-lede">{bet.hypothesis}</p>
      </div>

      {/* Shown for bets with no custom body of their own, so every bet reads
          the same way rather than some being a dead end. */}
      {!Body && (
        <div className="bet-card">
          {bet.result && <div className="bet-field"><span className="bet-k">Result</span><p>{bet.result}</p></div>}
          {bet.learning && <div className="bet-field"><span className="bet-k">Key learning</span><p>{bet.learning}</p></div>}
          {!bet.result && !bet.learning && (
            <p className="b2-fine" style={{ margin: 0 }}>
              This bet has not been written up yet.
            </p>
          )}
          {bet.links?.length > 0 && (
            <div className="bet-links">
              {bet.links.map((l) =>
                l.external
                  ? <a key={l.to} className="btn ghost sm" href={l.to} target="_blank" rel="noreferrer">{l.label}</a>
                  : <Link key={l.to} className={l.primary ? 'btn sm' : 'btn ghost sm'} to={l.to}>{l.label}</Link>
              )}
            </div>
          )}
          {!deck && !bet.links?.length && null}
        </div>
      )}

      {Body && <Body />}
    </div>
  )
}
