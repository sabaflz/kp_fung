import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isConfigured } from '../lib/supabase.js'
import { BENEFITS, BENEFIT_BY_ID, tallyResponses, analyzeResponses, summarize, AGREEMENT_BAR } from '../data/packages.js'
import BenefitIcon from '../components/BenefitIcon.jsx'
import { copyText, useToast } from '../components/ui.jsx'

function fmtWhen(iso) {
  if (!iso) return 'Unknown time'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Unknown time'
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

/* Bet #2 results: live win rates from the public package-choice survey. */
export default function Bet2({ embedded = false }) {
  const [rows, setRows] = useState([])
  const [state, setState] = useState('loading') // loading | ok | error | unconfigured
  // Closing follow-ups. Readable by the team only, so this stays empty for
  // invited viewers and the block below simply does not render for them.
  const [followups, setFollowups] = useState([])
  const [openId, setOpenId] = useState(null)   // which individual response is expanded
  const [showEmails, setShowEmails] = useState(false) // off by default: this page gets screen-shared
  const [limit, setLimit] = useState(50)
  const toast = useToast()
  const [bullseyeOnly, setBullseyeOnly] = useState(false)
  const [allPackages, setAllPackages] = useState(false)

  const refresh = useCallback(async () => {
    if (!isConfigured) { setState('unconfigured'); return }
    const { data, error } = await supabase
      .from('bet2_responses').select('*').order('created_at', { ascending: false })
    if (error) { setState('error'); return }
    setRows(data || [])
    setState('ok')
    // Separate query, and deliberately forgiving: if the table is not there yet
    // or this account cannot read it, the results above still show.
    const fu = await supabase
      .from('bet2_followups')
      .select('respondent, email, enabler, wants_results')
      .order('created_at', { ascending: false })
    setFollowups(fu.error ? [] : (fu.data || []))
  }, [])

  useEffect(() => {
    refresh()
    if (!isConfigured) return
    const ch = supabase.channel('bet2-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bet2_responses' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [refresh])

  const { ranking, topCombos, respondents, screens } = useMemo(() => tallyResponses(rows), [rows])
  const winners = ranking.slice(0, 3)

  // Deeper read of the same rows. Recomputed on every change, so it is always current.
  const analysis = useMemo(() => analyzeResponses(rows, { bullseyeOnly }), [rows, bullseyeOnly])
  const findings = useMemo(() => summarize(analysis, { bullseyeOnly }), [analysis, bullseyeOnly])
  const VERDICTS = {
    supported: ['Hypothesis supported', 'At least one benefit clears our 4-of-5 bar.'],
    partial: ['Partially supported', 'There is a leader, but it does not clear our 4-of-5 bar yet.'],
    'not-supported': ['Not supported so far', 'No benefit is favored by a clear majority of people.'],
    'not-yet': ['Too early to call', 'We need at least 5 people in this group before judging.'],
  }
  const copySummary = async () => {
    const head = `Bet #2 package survey, ${bullseyeOnly ? 'bullseye 18 to 30 only' : 'all respondents'}, as of ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
    const table = analysis.benefits.map((b) =>
      `${BENEFIT_BY_ID[b.id].name}: ${Math.round(b.mean * 100)}%` +
      (b.moe != null ? ` (±${Math.round(b.moe * 100)})` : '') + `, favored by ${b.favored} of ${b.n}`).join('\n')
    const text = [head, VERDICTS[analysis.verdict][0], '', ...findings.map((f) => '- ' + f), '', table].join('\n')
    toast((await copyText(text)) ? 'Summary copied' : 'Copy failed')
  }
  const ageCounts = useMemo(() => {
    const m = {}
    for (const r of rows) { const a = r.age || 'Not given'; m[a] = (m[a] || 0) + 1 }
    const order = ['Under 18', '18–20', '21–23', '24–26', '27–30', 'Over 30', 'Not given']
    return order.map((a) => [a, m[a] || 0]).filter(([, n]) => n > 0)
  }, [rows])
  const ageMax = Math.max(1, ...ageCounts.map(([, n]) => n))

  // Opt-in rate and what people said would make them use their top benefit.
  // No addresses here on purpose: this page gets presented on a shared screen.
  const fuStats = useMemo(() => {
    if (!followups.length) return null
    const optIns = followups.filter((r) => r.wants_results).length
    const m = {}
    for (const r of followups) { const e = (r.enabler || '').trim(); if (e) m[e] = (m[e] || 0) + 1 }
    const enablers = Object.entries(m).sort((a, b) => b[1] - a[1])
    return {
      answered: followups.length,
      optIns,
      rate: respondents ? optIns / respondents : 0,
      enablers,
      max: Math.max(1, ...enablers.map(([, n]) => n)),
    }
  }, [followups, respondents])

  // Follow-up keyed by respondent id, so an individual response can show the
  // answer that came with it. Newest wins if somehow there are two.
  const fuByRespondent = useMemo(() => {
    const m = {}
    for (const f of followups) {
      if (f.respondent && !m[f.respondent]) m[f.respondent] = f
    }
    return m
  }, [followups])

  // The interest list: everyone who left an email, de-duplicated.
  const interestEmails = useMemo(() => {
    const seen = new Set()
    for (const f of followups) {
      const e = (f.email || '').trim().toLowerCase()
      if (f.wants_results && e) seen.add(e)
    }
    return [...seen]
  }, [followups])
  const anyEmails = interestEmails.length > 0

  return (
    <div className="b2">
      <div className="bp-top">
        <span className="bp-eyebrow">Bet #2 <span className="bp-dot">·</span> <span className="bp-live">Collecting</span></span>
        <h1 className="bp-title">Which benefits win head-to-head</h1>
        <p className="bp-lede">We show two $300 packages, ten times, and let people pick. Every benefit meets every other an equal number of times, so each one earns a clean win rate. The results below update live.</p>
        <div className="bp-chips">
          {BENEFITS.map((bn) => (
            <span key={bn.id} className="bp-benefit"><BenefitIcon name={bn.icon} size={16} />{bn.name}</span>
          ))}
        </div>
      </div>
      {!embedded && (
        <div className="bp-nav bp-nav-top">
          <Link className="btn ghost sm" to="/bets">&larr; All bets</Link>
          <Link className="btn ghost sm" to="/present/bet1">Present Bet #1</Link>
        </div>
      )}

      <div className="b2-head">
        <div>
          <h2 className="b2-title">Bet #2 &middot; Package preference</h2>
          <p className="b2-desc">
            Live results from the public choice survey. Each person makes 10 head-to-head picks between
            two $300 packages, so every benefit is tested against every other an equal number of times.
            A win rate above 50% means people picked packages containing that benefit more often than not.
          </p>
        </div>
        <div className="b2-count">
          <span className="b2-count-n">{respondents}</span>
          <span className="b2-count-l">{respondents === 1 ? 'response' : 'responses'}</span>
        </div>
      </div>

      {state === 'unconfigured' && (
        <div className="b2-empty">Connect Supabase to see live results. The survey link still works.</div>
      )}
      {state === 'error' && (
        <div className="b2-empty">Could not load results. Make sure the bet2_responses table exists (run supabase_bet2_survey.sql).</div>
      )}
      {state === 'ok' && respondents === 0 && (
        <div className="b2-empty">No responses yet. Share the survey link and results will appear here live.</div>
      )}

      {state === 'ok' && respondents > 0 && (
        <>
          <div className="b2-winner">
            <span className="b2-winner-label">Winning package so far</span>
            <div className="b2-winner-chips">
              {winners.map((w) => (
                <span key={w.id} className="b2-chip">
                  <BenefitIcon name={BENEFIT_BY_ID[w.id].icon} size={16} />
                  {BENEFIT_BY_ID[w.id].name}
                </span>
              ))}
            </div>
            <span className="b2-winner-note">The three benefits with the highest win rates.</span>
          </div>

          <div className="b2-card">
            <div className="b2-resp-head">
              <h3 className="b2-h3">What the data says right now</h3>
              <div className="b2-seg" role="group" aria-label="Who to include">
                <button type="button" aria-pressed={!bullseyeOnly} onClick={() => setBullseyeOnly(false)}>
                  Everyone ({analysis.totalAll})
                </button>
                <button type="button" aria-pressed={bullseyeOnly} onClick={() => setBullseyeOnly(true)}>
                  Bullseye 18 to 30 ({analysis.bullseyeCount})
                </button>
              </div>
            </div>

            {analysis.n === 0 ? (
              <p className="b2-fine" style={{ marginTop: 0 }}>Nobody in this group has answered yet.</p>
            ) : (
              <>
                <div className={'b2-verdict is-' + analysis.verdict}>
                  <b>{VERDICTS[analysis.verdict][0]}</b>
                  <span>{VERDICTS[analysis.verdict][1]}</span>
                </div>
                <ul className="b2-findings">
                  {findings.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                <button type="button" className="btn ghost sm" onClick={copySummary}>Copy this summary</button>

                <h4 className="b2-resp-h4" style={{ marginTop: 26 }}>Each benefit, with its margin of error</h4>
                <div className="b2-ci-wrap">
                  <table className="b2-ci">
                    <thead>
                      <tr>
                        <th>Benefit</th>
                        <th>Average pick rate</th>
                        <th className="num">Rate</th>
                        <th className="num">Favored by</th>
                        <th>Read</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.benefits.map((b) => (
                        <tr key={b.id}>
                          <td className="b2-ci-name">
                            <BenefitIcon name={BENEFIT_BY_ID[b.id].icon} size={15} />
                            {BENEFIT_BY_ID[b.id].name}
                          </td>
                          <td>
                            <span className="b2-ci-track">
                              <span className="b2-ci-mid" />
                              {b.lo != null && (
                                <span className="b2-ci-band" style={{ left: `${b.lo * 100}%`, width: `${Math.max((b.hi - b.lo) * 100, 1)}%` }} />
                              )}
                              <span className="b2-ci-dot" style={{ left: `${b.mean * 100}%` }} />
                            </span>
                          </td>
                          <td className="num">
                            {Math.round(b.mean * 100)}%
                            {b.moe != null && <span className="b2-ci-moe"> ±{Math.round(b.moe * 100)}</span>}
                          </td>
                          <td className="num">{b.favored} of {b.n}</td>
                          <td>
                            <span className={'b2-call is-' + b.call}>
                              {b.call === 'ahead' ? 'Clearly ahead' : b.call === 'behind' ? 'Clearly behind' : 'Too close to call'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="b2-fine">
                  The dot is the average person&rsquo;s pick rate and the band is the 95% range around it. A band
                  that crosses the 50% line means we cannot yet say the benefit beats a coin flip. Each person
                  counts once, however many screens they answered. &ldquo;Favored by&rdquo; counts people who picked
                  that benefit more often than not, and our bar is {Math.round(AGREEMENT_BAR * 100)}%. One caution:
                  the six rates always average 50%, so a runaway leader pulls the others down.
                  &ldquo;Behind&rdquo; means behind the field, not unwanted.
                </p>

                <h4 className="b2-resp-h4" style={{ marginTop: 26 }}>All 20 possible packages, ranked</h4>
                <ul className="b2-combos">
                  {analysis.packages.slice(0, allPackages ? 20 : 5).map((c, idx) => (
                    <li key={c.ids.join('+')} className="b2-combo">
                      <span className="b2-combo-chips">
                        <span className="b2-pick-n">{idx + 1}</span>
                        {c.ids.map((id) => (
                          <span key={id} className="b2-chip b2-chip-sm">
                            <BenefitIcon name={BENEFIT_BY_ID[id].icon} size={14} />
                            {BENEFIT_BY_ID[id].name}
                          </span>
                        ))}
                      </span>
                      <span className="b2-combo-n">{c.picked} of {c.shown} ({Math.round(c.rate * 100)}%)</span>
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn ghost sm" style={{ marginTop: 12 }} onClick={() => setAllPackages(!allPackages)}>
                  {allPackages ? 'Show top 5 only' : 'Show all 20'}
                </button>
                <p className="b2-fine">
                  Every person sees each of the 20 three-benefit packages exactly once, so this is a fair
                  ranking of whole packages, not just single benefits.
                </p>

                {analysis.ages.length > 1 && (
                  <>
                    <h4 className="b2-resp-h4" style={{ marginTop: 26 }}>Who leads in each age group</h4>
                    <ul className="b2-ages">
                      {analysis.ages.map((g) => (
                        <li key={g.age}>
                          <span className="b2-ages-age">{g.age}</span>
                          <span className="b2-ages-n">{g.n} {g.n === 1 ? 'person' : 'people'}</span>
                          <span className="b2-ages-top">
                            <BenefitIcon name={BENEFIT_BY_ID[g.top.id].icon} size={14} />
                            {BENEFIT_BY_ID[g.top.id].name} {Math.round(g.top.mean * 100)}%
                            <span className="b2-ages-then">then {BENEFIT_BY_ID[g.second.id].name} {Math.round(g.second.mean * 100)}%</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="b2-fine">Groups this small are a hint about where to look, not a finding.</p>
                  </>
                )}
              </>
            )}
          </div>

          <div className="b2-card">
            <h3 className="b2-h3">Who answered</h3>
            <ul className="b2-bars">
              {ageCounts.map(([a, n]) => (
                <li key={a} className="b2-bar">
                  <span className="b2-bar-name">{a}</span>
                  <span className="b2-bar-track"><span className="b2-bar-fill" style={{ width: `${Math.max((n / ageMax) * 100, 3)}%` }} /></span>
                  <span className="b2-bar-pct">{n}</span>
                </li>
              ))}
            </ul>
            <p className="b2-fine">Age of the {respondents} {respondents === 1 ? 'person' : 'people'} who took the survey.</p>
          </div>

          <div className="b2-card">
            <h3 className="b2-h3">Benefit win rates</h3>
            <ul className="b2-bars">
              {ranking.map((r) => {
                const pct = Math.round(r.rate * 100)
                return (
                  <li key={r.id} className="b2-bar">
                    <span className="b2-bar-name">
                      <BenefitIcon name={BENEFIT_BY_ID[r.id].icon} size={16} />
                      {BENEFIT_BY_ID[r.id].name}
                    </span>
                    <span className="b2-bar-track">
                      <span className="b2-bar-fill" style={{ width: `${Math.max(pct, 2)}%` }} />
                      <span className="b2-bar-mid" />
                    </span>
                    <span className="b2-bar-pct">{pct}%</span>
                  </li>
                )
              })}
            </ul>
            <p className="b2-fine">The dashed line marks 50%. {screens} total choices across {respondents} {respondents === 1 ? 'person' : 'people'}.</p>
          </div>

          {topCombos.length > 0 && (
            <div className="b2-card">
              <h3 className="b2-h3">Most-picked exact packages</h3>
              <ul className="b2-combos">
                {topCombos.map((c, idx) => (
                  <li key={idx} className="b2-combo">
                    <span className="b2-combo-chips">
                      {c.ids.map((id) => (
                        <span key={id} className="b2-chip b2-chip-sm">
                          <BenefitIcon name={BENEFIT_BY_ID[id].icon} size={14} />
                          {BENEFIT_BY_ID[id].name}
                        </span>
                      ))}
                    </span>
                    <span className="b2-combo-n">{c.n} {c.n === 1 ? 'pick' : 'picks'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fuStats && (
            <div className="b2-card">
              <h3 className="b2-h3">Closing follow-up</h3>
              <p className="b2-desc" style={{ marginBottom: 14 }}>
                At the end of the survey people are asked what would make them actually use their
                top benefit, and invited to leave an email if they are interested in a package like
                this. {fuStats.optIns} of {respondents}{' '}
                {respondents === 1 ? 'respondent' : 'respondents'} joined the interest list, a{' '}
                {Math.round(fuStats.rate * 100)}% opt-in rate.
              </p>
              {fuStats.enablers.length > 0 && (
                <>
                  <ul className="b2-bars">
                    {fuStats.enablers.map(([label, n]) => (
                      <li key={label} className="b2-bar">
                        <span className="b2-bar-name">{label}</span>
                        <span className="b2-bar-track">
                          <span className="b2-bar-fill" style={{ width: `${Math.max((n / fuStats.max) * 100, 3)}%` }} />
                        </span>
                        <span className="b2-bar-pct">{n}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="b2-fine">
                    What would make them use it, from the {fuStats.answered}{' '}
                    {fuStats.answered === 1 ? 'person' : 'people'} who answered the closing question.
                  </p>
                </>
              )}
            </div>
          )}

          <div className="b2-card">
            <div className="b2-resp-head">
              <h3 className="b2-h3">Individual responses</h3>
              {anyEmails && (
                <label className="b2-reveal">
                  <input
                    type="checkbox"
                    checked={showEmails}
                    onChange={(e) => setShowEmails(e.target.checked)}
                  />
                  Show email addresses
                </label>
              )}
              {anyEmails && showEmails && (
                <button
                  type="button"
                  className="btn ghost sm"
                  onClick={async () => toast((await copyText(interestEmails.join(', '))) ? `${interestEmails.length} emails copied` : 'Copy failed')}
                >
                  Copy interest list ({interestEmails.length})
                </button>
              )}
            </div>
            <p className="b2-desc" style={{ marginBottom: 16 }}>
              Every response, newest first. Click one to see the ten picks behind it and what that
              person said at the end.
              {anyEmails && ' Email addresses stay hidden until you ask for them, so this page is safe to share on a screen.'}
            </p>

            <ul className="b2-resp">
              {rows.slice(0, limit).map((r) => {
                const open = openId === r.id
                const own = tallyResponses([r])
                const top = own.ranking.find((x) => x.appear > 0)
                const fu = fuByRespondent[r.respondent]
                const picks = r.choices || []
                return (
                  <li key={r.id} className={'b2-resp-item' + (open ? ' is-open' : '')}>
                    <button
                      type="button"
                      className="b2-resp-row"
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : r.id)}
                    >
                      <span className="b2-resp-when">{fmtWhen(r.created_at)}</span>
                      <span className="b2-resp-age">{r.age || 'Age not given'}</span>
                      <span className="b2-resp-top">
                        {top ? (
                          <>
                            <BenefitIcon name={BENEFIT_BY_ID[top.id].icon} size={14} />
                            {BENEFIT_BY_ID[top.id].name}
                          </>
                        ) : '—'}
                      </span>
                      <span className="b2-resp-tags">
                        {fu?.wants_results && <span className="b2-resp-flag">interested</span>}
                        <span className="b2-resp-caret" aria-hidden="true">{open ? '−' : '+'}</span>
                      </span>
                    </button>

                    {open && (
                      <div className="b2-resp-body">
                        <h4 className="b2-resp-h4">Their ten picks</h4>
                        <ol className="b2-picks">
                          {picks.map((ch, i) => {
                            const chosen = ch.chosen === 'right' ? ch.right : ch.left
                            const other = ch.chosen === 'right' ? ch.left : ch.right
                            return (
                              <li key={i} className="b2-pick">
                                <span className="b2-pick-n">{i + 1}</span>
                                <span className="b2-pick-side">
                                  {(chosen || []).map((id) => (
                                    <span key={id} className="b2-chip b2-chip-sm b2-chip-won">
                                      <BenefitIcon name={BENEFIT_BY_ID[id]?.icon} size={13} />
                                      {BENEFIT_BY_ID[id]?.name || id}
                                    </span>
                                  ))}
                                </span>
                                <span className="b2-pick-vs">over</span>
                                <span className="b2-pick-side b2-pick-lost">
                                  {(other || []).map((id) => (
                                    <span key={id} className="b2-chip b2-chip-sm">
                                      <BenefitIcon name={BENEFIT_BY_ID[id]?.icon} size={13} />
                                      {BENEFIT_BY_ID[id]?.name || id}
                                    </span>
                                  ))}
                                </span>
                              </li>
                            )
                          })}
                        </ol>
                        {picks.length !== 10 && (
                          <p className="b2-fine">
                            {picks.length} of 10 screens answered, so this one is partial.
                          </p>
                        )}

                        <h4 className="b2-resp-h4">How often they picked each benefit</h4>
                        <ul className="b2-bars">
                          {own.ranking.filter((x) => x.appear > 0).map((x) => (
                            <li key={x.id} className="b2-bar">
                              <span className="b2-bar-name">
                                <BenefitIcon name={BENEFIT_BY_ID[x.id].icon} size={16} />
                                {BENEFIT_BY_ID[x.id].name}
                              </span>
                              <span className="b2-bar-track">
                                <span className="b2-bar-fill" style={{ width: `${Math.max(x.rate * 100, 2)}%` }} />
                                <span className="b2-bar-mid" />
                              </span>
                              <span className="b2-bar-pct">{x.wins}/{x.appear}</span>
                            </li>
                          ))}
                        </ul>

                        <h4 className="b2-resp-h4">At the end of the survey</h4>
                        {fu ? (
                          <dl className="b2-resp-fu">
                            {fu.enabler && (
                              <>
                                <dt>What would make them use it</dt>
                                <dd>{fu.enabler}</dd>
                              </>
                            )}
                            <dt>Joined the interest list</dt>
                            <dd>{fu.wants_results ? 'Yes' : 'No'}</dd>
                            {fu.wants_results && fu.email && (
                              <>
                                <dt>Email</dt>
                                <dd>
                                  {showEmails
                                    ? fu.email
                                    : <span className="b2-mask">hidden, tick “Show email addresses” above</span>}
                                </dd>
                              </>
                            )}
                          </dl>
                        ) : (
                          <p className="b2-fine" style={{ marginTop: 0 }}>
                            They finished the picks but did not answer the closing question.
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            {rows.length > limit && (
              <button type="button" className="btn ghost sm" style={{ marginTop: 14 }} onClick={() => setLimit(limit + 50)}>
                Show more ({rows.length - limit} left)
              </button>
            )}
          </div>

          <div className="b2-share">
            <span>Survey link to share:</span>
            <code>{typeof window !== 'undefined' ? window.location.origin + '/packages' : '/packages'}</code>
          </div>
        </>
      )}
    </div>
  )
}
