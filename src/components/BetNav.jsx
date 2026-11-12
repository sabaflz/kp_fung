import { Link, NavLink } from 'react-router-dom'
import { BETS } from '../data/bets.js'
import { DECKS } from '../decks/index.js'

/* One navigation strip shared by the Bets hub and every bet page, so moving
   between bets never means going back to the hub first. Driven entirely by
   BETS, so adding Bet #4 to that array puts it here with no other change. */

export default function BetNav({ current }) {
  const bet = BETS.find((b) => b.id === current)
  const deck = bet && DECKS['bet' + bet.id]
  return (
    <nav className="betnav" aria-label="Bets">
      <div className="betnav-tabs">
        <NavLink end to="/bets" className={({ isActive }) => 'betnav-tab' + (isActive ? ' is-on' : '')}>
          All bets
        </NavLink>
        {BETS.map((b) => (
          <NavLink
            key={b.id}
            to={`/bets/${b.id}`}
            className={({ isActive }) => 'betnav-tab' + (isActive ? ' is-on' : '')}
          >
            Bet #{b.id}
            <span className={'betnav-dot s-' + b.status.toLowerCase().replace(/\s+/g, '-')} aria-hidden="true" />
          </NavLink>
        ))}
      </div>
      {deck && (
        <Link className="btn ghost sm betnav-present" to={`/present/bet${bet.id}`}>
          &#9658; Present Bet #{bet.id}
        </Link>
      )}
    </nav>
  )
}
