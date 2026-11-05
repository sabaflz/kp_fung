import { Link } from 'react-router-dom'

/* Bet #1, as a presentable page: the validated finding, the proof, and the quote.
   Designed to read like a slide so the team can present it straight from the site. */
const Check = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
)
const Warn = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>
)
const Star = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1L12 2Z" /></svg>
)

export default function Bet1({ embedded = false }) {
  return (
    <div className="bp">
      <div className="bp-top">
        <span className="bp-eyebrow">Bet #1 <span className="bp-dot">·</span> <span className="bp-ok">Supported</span></span>
        <h1 className="bp-title">A flexible wallet beats a set bundle</h1>
        <p className="bp-lede">Our first bet: shown two $300 packages, young adults can name what they would prioritize and why. They did, and they agreed on the shape of the product.</p>
      </div>

      <div className="bp-hero">
        <div className="bp-stat">
          <span className="bp-stat-n">5 / 5</span>
          <span className="bp-stat-l">chose the flexible $300 wallet over the pre-split bundle, in both presentation orders.</span>
        </div>
        <ul className="bp-finds">
          <li className="bp-find">
            <span className="bp-chip bp-chip-ok"><Check /></span>
            <p>All 5 named a specific priority benefit, with a reason, inside 15 minutes.</p>
          </li>
          <li className="bp-find">
            <span className="bp-chip bp-chip-warn"><Warn /></span>
            <p>The recurring barrier is <b>comprehension</b>: several misread the pre-split package as a cost, or could not tell what a benefit like &ldquo;everyday health&rdquo; meant.</p>
          </li>
          <li className="bp-find">
            <span className="bp-chip bp-chip-brand"><Star /></span>
            <p>Priorities named most often: <b>dental</b> and <b>fitness</b>, then <b>vision</b>.</p>
          </li>
        </ul>
      </div>

      <blockquote className="bp-quote">
        &ldquo;Package B makes people reserve money for something they might not need. That&rsquo;s why I prefer A. It gives you much more flexibility.&rdquo;
      </blockquote>

      {!embedded && (
        <div className="bp-nav">
          <Link className="btn ghost sm" to="/bets">&larr; All bets</Link>
          <Link className="btn ghost sm" to="/interviews/log">See the 5 interviews</Link>
          <Link className="btn ghost sm" to="/present?s=0">&#9658; Present</Link>
          <Link className="btn sm bp-next" to="/bets/2">Next: Bet #2 &rarr;</Link>
        </div>
      )}
    </div>
  )
}
