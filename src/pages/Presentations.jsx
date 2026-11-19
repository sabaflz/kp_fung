import { Link } from 'react-router-dom'
import { DECKS, DECK_LIST } from '../decks/index.js'

/* Every deck in one place, newest first. The preview is the deck's real first
   slide, drawn at a quarter size, so it can never show an out-of-date title. */

const W = 320
const SCALE = W / 1280

export default function Presentations() {
  const list = [...DECK_LIST].reverse().filter((d) => DECKS[d.id])
  return (
    <div className="grid" style={{ gap: 18 }}>
      <div>
        <div className="eyebrow">Decks</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
          Presentations
        </h1>
        <p className="lede" style={{ margin: 0 }}>
          Every deck we have shown, newest on top. Open one to present it full screen.
        </p>
      </div>

      <div className="pres-list">
        {list.map((d, i) => {
          const deck = DECKS[d.id]
          return (
            <Link key={d.id} to={`/present/${d.id}`} className="pres-card">
              <div className="pres-thumb" aria-hidden="true">
                <div style={{ width: 1280, height: 720, transform: `scale(${SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                  {deck.slides[0].node}
                </div>
              </div>
              <div className="pres-body">
                <div className="pres-meta">
                  <span className="pres-stage">{d.stage}</span>
                  {i === 0 && <span className="pres-latest">Latest</span>}
                </div>
                <h2 className="pres-title">{deck.title}</h2>
                <p className="pres-blurb">{d.blurb}</p>
                <div className="pres-foot">
                  <span>{d.when ? `${d.when} · ` : ''}{deck.slides.length} slides</span>
                  <span className="pres-open">Present <span aria-hidden="true">&rarr;</span></span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
