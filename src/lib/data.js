import { useEffect, useState, useCallback } from 'react'
import { supabase, isConfigured } from './supabase.js'
import { POOL } from '../data/pool.js'

// The built-in questions act as the fallback until the shared table loads
// (or if the questions migration has not been run yet).
const SEED = POOL

/* Shared interviews, live-synced across the team. */
export function useInterviews() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isConfigured) { setLoading(false); return }
    const { data, error } = await supabase
      .from('interviews').select('*').order('created_at', { ascending: false })
    if (!error) setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    if (!isConfigured) return
    const ch = supabase.channel('interviews-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interviews' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [refresh])

  return { rows, loading, refresh }
}

export async function addInterview(record) {
  const { data: u } = await supabase.auth.getUser()
  const payload = { ...record, created_by: u?.user?.id ?? null }
  const { error } = await supabase.from('interviews').insert(payload)
  if (error) throw error
}

export async function updateInterview(id, patch) {
  const { error } = await supabase.from('interviews').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteInterview(id) {
  const { error } = await supabase.from('interviews').delete().eq('id', id)
  if (error) throw error
}

/* Shared question sets, live-synced. */
export function useSets() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isConfigured) { setLoading(false); return }
    const { data, error } = await supabase
      .from('question_sets').select('*').order('created_at', { ascending: true })
    if (!error) setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    if (!isConfigured) return
    const ch = supabase.channel('sets-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'question_sets' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [refresh])

  return { rows, loading, refresh }
}

/* Shared question pool, live-synced. Rows come back as [id, group, text]
   tuples so the rest of the app keeps working unchanged. */
export function useQuestions() {
  const [rows, setRows] = useState(SEED)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isConfigured) { setRows(SEED); setLoading(false); return }
    const { data, error } = await supabase
      .from('questions').select('*').order('ord', { ascending: true })
    if (!error && data && data.length) setRows(data.map((r) => [r.id, r.grp, r.body]))
    else if (!error) setRows(SEED) // table exists but not seeded yet
    // on error (table not created yet) keep the built-in seed
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    if (!isConfigured) return
    const ch = supabase.channel('questions-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [refresh])

  return { rows, loading, refresh }
}

export function newQuestionId() {
  return 'C' + Date.now().toString(36) + Math.floor(Math.random() * 1e3).toString(36)
}

export async function addQuestion(grp, body) {
  const { data: u } = await supabase.auth.getUser()
  const { error } = await supabase.from('questions').insert({
    id: newQuestionId(), grp: grp || 'Custom', body, ord: Date.now(), created_by: u?.user?.id ?? null,
  })
  if (error) throw error
}

export async function updateQuestion(id, patch) {
  const { error } = await supabase.from('questions').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteQuestion(id) {
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) throw error
}

export async function addSet(name, ids, note) {
  const { data: u } = await supabase.auth.getUser()
  const { error } = await supabase.from('question_sets')
    .insert({ name, question_ids: ids, note: note || 'Custom set', created_by: u?.user?.id ?? null })
  if (error) throw error
}

export async function deleteSet(id) {
  const { error } = await supabase.from('question_sets').delete().eq('id', id)
  if (error) throw error
}

/* ---- Survey outreach log (where we shared the survey), live-synced ---- */
export function useShares() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isConfigured) { setLoading(false); return }
    const { data, error } = await supabase
      .from('shares').select('*').order('created_at', { ascending: false })
    if (!error) setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    if (!isConfigured) return
    const ch = supabase.channel('shares-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shares' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [refresh])

  return { rows, loading, refresh }
}

export async function addShare(record) {
  const { data: u } = await supabase.auth.getUser()
  const { error } = await supabase.from('shares').insert({ ...record, created_by: u?.user?.id ?? null })
  if (error) throw error
}

export async function deleteShare(id) {
  const { error } = await supabase.from('shares').delete().eq('id', id)
  if (error) throw error
}

/* ---- Shared key/value settings (survey + sheet links), live-synced ---- */
export function useSettings() {
  const [map, setMap] = useState({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isConfigured) { setLoading(false); return }
    const { data, error } = await supabase.from('settings').select('*')
    if (!error) {
      const m = {}
      for (const r of (data || [])) m[r.key] = r.value
      setMap(m)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    if (!isConfigured) return
    const ch = supabase.channel('settings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [refresh])

  return { map, loading, refresh }
}

export async function setSetting(key, value) {
  const { error } = await supabase.from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw error
}
