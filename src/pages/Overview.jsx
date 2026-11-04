import { useFindings } from '../lib/findings.js'
import BenefitIcon from '../components/BenefitIcon.jsx'

const pctLabel = (x) => (x == null ? '—' : `${Math.round(x * 100)}%`)
const COLORS = { i: 'var(--iv)', s: 'var(--sv)', b: '#7c3aed' }

function Cell({ x, color }) {
  const w = x == null ? 0 : Math.max(x * 100, x > 0 ? 3 : 0)
  return (
    <span className="fo-cell">
      <span className="fo-cell-track"><span className="fo-cell-fill" style={{ width: `${w}%`, background: color }} /></span>
      <span className="fo-cell-pct">{pctLabel(x)}</span>
    </span>
  )
}

export default function Overview() {
  const { benefits, bestPackage, counts, hasAny } = useFindings()

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div>
        <div className="eyebrow">Findings</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
          What we&rsquo;re learning
        </h1>
        <p className="lede">
          The whole goal is to land on the supplemental package 18 to 30 year olds would actually choose. This lines up every
          benefit across all three of our sources, so a benefit that wins everywhere is a signal we can trust.
        </p>
      </div>

      <div className="tiles">
        <div className="tile"><div className="n">{counts.interviews}</div><div className="l">interviews</div></div>
        <div className="tile"><div className="n">{counts.survey}</div><div className="l">survey responses</div></div>
        <div className="tile"><div className="n">{counts.bet}</div><div className="l">choice-test responses</div></div>
      </div>

      {!hasAny && (
        <div className="card"><div className="empty">No data yet. This fills in as interviews, survey responses, and choice-test responses come in.</div></div>
      )}

      {hasAny && (
        <>
          <div className="fo-best">
            <span className="fo-best-label">Current best-guess package</span>
            <div className="fo-best-chips">
              {bestPackage.map((b) => (
                <span key={b.id} className="fo-chip"><BenefitIcon name={b.icon} size={16} />{b.name}</span>
              ))}
            </div>
            <span className="fo-best-note">The three benefits that score highest across all sources. This updates as more data arrives.</span>
          </div>

          <div className="card">
            <div className="hd">
              <h2>Benefit by benefit, across every source</h2>
            </div>
            <div className="bd">
              <div className="fo-legend">
                <span><span className="fo-dot" style={{ background: COLORS.i }} />Interviews: share who named it</span>
                <span><span className="fo-dot" style={{ background: COLORS.s }} />Survey: share who named it</span>
                <span><span className="fo-dot" style={{ background: COLORS.b }} />Choice test: head-to-head win rate</span>
              </div>
              <div className="fo-table">
                <div className="fo-head">
                  <span>Benefit</span><span>Interviews</span><span>Survey</span><span>Choice test</span>
                </div>
                {benefits.map((b) => (
                  <div className="fo-row" key={b.id}>
                    <span className="fo-name"><BenefitIcon name={b.icon} size={16} />{b.name}</span>
                    <Cell x={b.iPct} color={COLORS.i} />
                    <Cell x={b.sPct} color={COLORS.s} />
                    <Cell x={b.bPct} color={COLORS.b} />
                  </div>
                ))}
              </div>
              <p className="fo-fine">
                These are three different measures, so read them for agreement, not exact match. Dashes mean that source has no data for
                that benefit yet.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
