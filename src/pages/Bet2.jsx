import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isConfigured } from '../lib/supabase.js'
import { BENEFITS, BENEFIT_BY_ID, tallyResponses } from '../data/packages.js'
import BenefitIcon from '../components/BenefitIcon.jsx'

/* Bet #2 results: live win rates from the public package-choice survey. */
export default function Bet2({ embedded = false }) {
  const [rows, setRows] = useState([])
  const [state, setState] = useState('loading') // loading | ok | error | unconfigured
  // Closing follow-ups. Readable by the team only, so this stays empty for
  // invited viewers and the block below simply does not render for them.
  const [followups, setFollowups] = useState([])

  const refresh = useCallback(async () => {
    if (!isConfigured) { setState('unconfigured'); return }
    const { data, error } = await supabase
      .from('bet2_responses').select('*').order('created_at', { ascending: false })
    if (error) { setState('error'); return }
    setRows(data || [])
    setState('ok')
    // Separate query, and deliberately forgiving: if the table is not there yet
    // or this account cannot read it, the results above still show.
    const fu = await supabase.from('bet2_followups').select('wants_results, enabler')
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
                top benefit, and offered their results by email. {fuStats.optIns} of {respondents}{' '}
                {respondents === 1 ? 'respondent' : 'respondents'} asked for their results, a{' '}
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

          <div className="b2-share">
            <span>Survey link to share:</span>
            <code>{typeof window !== 'undefined' ? window.location.origin + '/packages' : '/packages'}</code>
          </div>
        </>
      )}
    </div>
  )
}
