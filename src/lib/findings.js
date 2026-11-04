import { useEffect, useMemo, useState } from 'react'
import { supabase, isConfigured } from './supabase.js'
import { useInterviews, useSettings } from './data.js'
import { useSurvey } from './survey.js'
import { snapBenefits } from '../data/pool.js'
import { BENEFITS, tallyResponses } from '../data/packages.js'

/* Live Bet #2 responses (authenticated read). */
function useBet2() {
  const [rows, setRows] = useState([])
  useEffect(() => {
    if (!isConfigured) return
    let cancelled = false
    const load = async () => {
      const { data, error } = await supabase.from('bet2_responses').select('*')
      if (!cancelled && !error) setRows(data || [])
    }
    load()
    const ch = supabase.channel('bet2-findings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bet2_responses' }, load)
      .subscribe()
    return () => { cancelled = true; supabase.removeChannel(ch) }
  }, [])
  return rows
}

/* Triangulate benefit preference across interviews, the survey, and the Bet #2
   choice test, on the six shared benefit categories, and pick a best guess. */
export function useFindings() {
  const { rows: interviews } = useInterviews()
  const { map } = useSettings()
  const survey = useSurvey(map.survey_csv_url)
  const bet2Rows = useBet2()

  return useMemo(() => {
    const nI = interviews.length
    const nS = survey.responses || 0
    const { ranking, respondents: nB } = tallyResponses(bet2Rows)
    const rateById = Object.fromEntries(ranking.map((r) => [r.id, r.rate]))

    // Interviews: how many named each benefit (priorities + top benefit).
    const iCount = {}
    for (const r of interviews) {
      const named = new Set(snapBenefits(`${r.benefits_want || ''} ${r.top_benefit || ''}`))
      for (const c of named) iCount[c] = (iCount[c] || 0) + 1
    }
    // Survey: "benefits wanted" mentions, already canonical [label, n].
    const sCount = Object.fromEntries(survey.want || [])

    const benefits = BENEFITS.map((b) => {
      const iPct = nI ? (iCount[b.canonical] || 0) / nI : null
      const sPct = nS ? (sCount[b.canonical] || 0) / nS : null
      const bPct = nB ? (rateById[b.id] ?? null) : null
      const parts = [iPct, sPct, bPct].filter((x) => x != null)
      const composite = parts.length ? parts.reduce((a, x) => a + x, 0) / parts.length : 0
      return { ...b, iPct, sPct, bPct, composite }
    }).sort((a, b) => b.composite - a.composite)

    const hasAny = nI + nS + nB > 0
    const bestPackage = hasAny ? benefits.slice(0, 3) : []

    return { benefits, bestPackage, counts: { interviews: nI, survey: nS, bet: nB }, hasAny }
  }, [interviews, survey.responses, survey.want, bet2Rows])
}
