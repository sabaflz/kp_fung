// Shared buckets so interview answers and survey answers land in the SAME
// categories and can be combined. Each function takes a raw string (an
// interview field or a survey cell) and returns a canonical bucket, or ''
// when there is nothing to count.

const has = (t, arr) => arr.some((k) => t.includes(k))

export function coverageBucket(text) {
  const t = (text || '').toLowerCase().trim()
  if (!t) return ''
  if (has(t, ['ship', 'student health', 'school plan', 'university health', 'campus health'])) return 'School plan (SHIP)'
  if (has(t, ['medi-cal', 'medical ', 'medicaid', 'public program', 'iehp', 'medicare'])) return 'Medi-Cal or public'
  if (has(t, ['parent', "parents'", 'family plan', 'mother', 'father', ' mom', ' dad'])) return "Parent's plan"
  if (has(t, ['employer', 'through work', 'through my job', 'work-sponsored', 'aetna', 'costco'])) return 'Employer plan'
  if (has(t, ['marketplace', 'covered california', 'cobra', 'private plan'])) return 'Marketplace / other'
  if (has(t, ['uninsured', 'no insurance', 'no coverage'])) return 'Uninsured'
  return 'Other / unclear'
}

export function situationBucket(text) {
  const t = (text || '').toLowerCase().trim()
  if (!t) return ''
  const student = has(t, ['student', 'in school', 'college', 'undergrad', 'university', 'school'])
  const working = has(t, ['working', 'work ', 'worker', 'employed', ' job', 'teacher', 'nurse', 'fellowship', 'intern'])
  if (student && working) return 'Working student'
  if (student) return 'Student'
  if (working) return 'Working'
  if (has(t, ['unemployed', 'neither', 'not working'])) return 'Neither'
  return 'Other'
}

export function useBucket(text) {
  const t = (text || '').toLowerCase().trim()
  if (!t) return ''
  if (t.includes('unlikely') || t.includes('would not') || t.includes("wouldn't") ||
      (t.includes('not') && (t.includes('definitely') || t.includes('probably')))) return 'Unlikely'
  if (t.includes('maybe') || t.includes('might') || t.includes('unsure') || t.includes('depends')) return 'Maybe'
  if (t.includes('likely') || t.includes('definitely') || t.includes('probably') || t === 'yes' || t.includes('would use')) return 'Likely'
  return ''
}

export function choiceBucket(text) {
  const t = (text || '').toLowerCase().trim()
  if (!t) return ''
  if (t.includes('no preference') || t.includes('either') || t.includes('neither') || t.includes('no difference')) return 'No preference'
  if (t.includes('without') || t.includes('the other') || t.includes('would not') ||
      (t.includes('not') && t.includes('benefit'))) return 'Without the benefit'
  if (t.includes('with') || t.includes('preferred') || t.includes('definitely') || t.includes('probably') || t.includes('pick it')) return 'With the benefit'
  return ''
}
