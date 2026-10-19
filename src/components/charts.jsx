// Shared chart components + helpers used by the Dashboard, Interviews and
// Survey tabs, so the whole app draws data the same way.

export function tally(values) {
  const m = {}
  for (const v of values) {
    const k = (v || '').trim()
    if (!k) continue
    m[k] = (m[k] || 0) + 1
  }
  return Object.entries(m).sort((a, b) => b[1] - a[1])
}

export function splitMany(s) {
  return (s || '').split(/[,;\n|]/).map((x) => x.trim()).filter((x) => x.length > 1)
}

// Merge an interview tally and a survey tally into [label, iN, sN] triples,
// so one chart can show both sources. Sorted by combined count.
export function combineTriples(iT, sT) {
  const m = {}
  for (const [k, v] of iT) (m[k] ||= { i: 0, s: 0 }).i += v
  for (const [k, v] of sT) (m[k] ||= { i: 0, s: 0 }).s += v
  return Object.entries(m)
    .map(([label, { i, s }]) => [label, i, s])
    .sort((a, b) => (b[1] + b[2]) - (a[1] + a[2]))
}

// Plain bars for a single source. Optional color (defaults to the teal accent).
export function Bars({ data, empty, total, color, limit = 100 }) {
  if (!data.length) return <div className="empty">{empty}</div>
  const max = data[0][1]
  return (
    <div className="bars">
      {data.slice(0, limit).map(([label, n]) => (
        <div className="bar" key={label}>
          <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{label}</span>
          <div className="track"><div className="fill" style={{ width: Math.max(6, (n / max) * 100) + '%', background: color || 'var(--accent)' }} /></div>
          <span className="v">{total ? `${n} · ${Math.round((n / total) * 100)}%` : n}</span>
        </div>
      ))}
    </div>
  )
}

// Stacked bars for rankings: teal = interviews, orange = survey, per the toggle.
export function SplitBars({ data, source, iTotal, sTotal, empty }) {
  const value = (i, s) => source === 'interviews' ? i : source === 'survey' ? s : i + s
  const visible = data.filter(([, i, s]) => value(i, s) > 0)
  if (!visible.length) return <div className="empty">{empty}</div>
  const max = Math.max(1, ...visible.map(([, i, s]) => value(i, s)))
  const denom = source === 'interviews' ? iTotal : source === 'survey' ? sTotal : iTotal + sTotal
  const showIv = source !== 'survey'
  const showSv = source !== 'interviews'
  return (
    <div className="bars">
      {visible.map(([label, i, s]) => {
        const v = value(i, s)
        return (
          <div className="bar" key={label}>
            <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{label}</span>
            <div className="track">
              {showIv && i > 0 && <div className="seg" style={{ width: (i / max) * 100 + '%', background: 'var(--iv)' }} title={`${i} from interview${i === 1 ? '' : 's'}`} />}
              {showSv && s > 0 && <div className="seg" style={{ width: (s / max) * 100 + '%', background: 'var(--sv)' }} title={`${s} from survey`} />}
            </div>
            <span className="v">{denom ? `${v} · ${Math.round((v / denom) * 100)}%` : v}</span>
          </div>
        )
      })}
    </div>
  )
}

// Donut slice colors: no teal or orange, so those stay reserved for source.
export const SLICE = ['#6366f1', '#0ea5e9', '#8b5cf6', '#22c55e', '#f43f5e', '#94a3b8']

export function Donut({ data, size = 148, palette = SLICE, unit = 'responses' }) {
  const r = 56, sw = 22, C = 2 * Math.PI * r, cx = size / 2, cy = size / 2
  const tot = data.reduce((s, [, nn]) => s + nn, 0) || 1
  let off = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="donut chart" style={{ flex: 'none' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={sw} />
      {data.map(([label, nn], i) => {
        const f = nn / tot
        const el = (
          <circle key={label} cx={cx} cy={cy} r={r} fill="none" stroke={palette[i % palette.length]} strokeWidth={sw}
            strokeDasharray={`${f * C} ${C - f * C}`} strokeDashoffset={-off * C} transform={`rotate(-90 ${cx} ${cy})`} />
        )
        off += f
        return el
      })}
      <text x={cx} y={cy - 1} textAnchor="middle" fontSize="27" fontWeight="700" fill="var(--fg)" style={{ fontVariantNumeric: 'tabular-nums' }}>{tot}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="var(--faint)">{unit}</text>
    </svg>
  )
}

export function Legend({ data, palette = SLICE }) {
  const tot = data.reduce((s, [, n]) => s + n, 0) || 1
  return (
    <div style={{ display: 'grid', gap: 9, minWidth: 0, flex: 1 }}>
      {data.map(([label, n], i) => (
        <div key={label} className="row" style={{ justifyContent: 'space-between', gap: 10, flexWrap: 'nowrap' }}>
          <span className="row" style={{ gap: 8, minWidth: 0, flexWrap: 'nowrap' }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: palette[i % palette.length], flex: 'none' }} />
            <span style={{ overflowWrap: 'anywhere', fontSize: 13 }}>{label}</span>
          </span>
          <span style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', fontSize: 12.5 }}>{n} &middot; {Math.round((n / tot) * 100)}%</span>
        </div>
      ))}
    </div>
  )
}

// Two concentric rings so a donut can still show both sources: survey on the
// outer ring, interviews on the inner, same color per category. Follows the
// toggle (one ring in single-source mode). data = [label, iN, sN] triples.
export function TwoRingDonut({ data, source, size = 150, palette = SLICE }) {
  const cx = size / 2, cy = size / 2
  const iTot = data.reduce((a, [, i]) => a + i, 0)
  const sTot = data.reduce((a, [, , s]) => a + s, 0)
  const surveyRing = { tot: sTot, pick: (row) => row[2] }
  const ivRing = { tot: iTot, pick: (row) => row[1] }
  let rings = []
  if (source === 'interviews') rings = [{ ...ivRing, r: 56, sw: 20 }]
  else if (source === 'survey') rings = [{ ...surveyRing, r: 56, sw: 20 }]
  else if (sTot > 0 && iTot > 0) rings = [{ ...surveyRing, r: 58, sw: 13 }, { ...ivRing, r: 40, sw: 13 }]
  else if (sTot > 0) rings = [{ ...surveyRing, r: 56, sw: 20 }]
  else rings = [{ ...ivRing, r: 56, sw: 20 }]
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none' }} role="img" aria-label="donut chart">
      {rings.map((ring, ri) => {
        const C = 2 * Math.PI * ring.r
        let off = 0
        return (
          <g key={ri}>
            <circle cx={cx} cy={cy} r={ring.r} fill="none" stroke="var(--surface-2)" strokeWidth={ring.sw} />
            {ring.tot > 0 && data.map((row, i) => {
              const v = ring.pick(row)
              if (!v) return null
              const f = v / ring.tot
              const el = <circle key={row[0]} cx={cx} cy={cy} r={ring.r} fill="none" stroke={palette[i % palette.length]} strokeWidth={ring.sw}
                strokeDasharray={`${f * C} ${C - f * C}`} strokeDashoffset={-off * C} transform={`rotate(-90 ${cx} ${cy})`} />
              off += f
              return el
            })}
          </g>
        )
      })}
    </svg>
  )
}

export function TwoRingDonutCard({ title, note, data, source, empty, palette = SLICE }) {
  const val = ([, i, s]) => source === 'interviews' ? i : source === 'survey' ? s : i + s
  const shown = data.map((row, idx) => ({ label: row[0], v: val(row), idx })).filter((x) => x.v > 0)
  const tot = shown.reduce((a, x) => a + x.v, 0) || 1
  const iTot = data.reduce((a, [, i]) => a + i, 0)
  const sTot = data.reduce((a, [, , s]) => a + s, 0)
  const twoRings = source === 'both' && iTot > 0 && sTot > 0
  return (
    <div className="card">
      <div className="hd"><h2>{title}</h2>{note && <span className="note">{note}</span>}</div>
      <div className="bd">
        {shown.length === 0 ? <div className="empty">{empty}</div> : (
          <>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <TwoRingDonut data={data} source={source} palette={palette} />
              <div style={{ display: 'grid', gap: 9, minWidth: 0, flex: 1 }}>
                {shown.map((x) => (
                  <div key={x.label} className="row" style={{ justifyContent: 'space-between', gap: 10, flexWrap: 'nowrap' }}>
                    <span className="row" style={{ gap: 8, minWidth: 0, flexWrap: 'nowrap' }}>
                      <span style={{ width: 11, height: 11, borderRadius: 3, background: palette[x.idx % palette.length], flex: 'none' }} />
                      <span style={{ overflowWrap: 'anywhere', fontSize: 13 }}>{x.label}</span>
                    </span>
                    <span style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', fontSize: 12.5 }}>{x.v} &middot; {Math.round((x.v / tot) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
            {source === 'both' && (
              <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 10 }}>
                {twoRings ? 'inner ring: interviews · outer ring: survey' : 'survey only so far · interviews fill the inner ring as they are logged'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function DonutCard({ title, note, data, empty, unit }) {
  return (
    <div className="card">
      <div className="hd"><h2>{title}</h2>{note && <span className="note">{note}</span>}</div>
      <div className="bd">
        {data.length === 0 ? <div className="empty">{empty}</div> : (
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <Donut data={data} unit={unit} />
            <Legend data={data} />
          </div>
        )}
      </div>
    </div>
  )
}
