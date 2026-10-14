import { useEffect, useState, useCallback } from 'react'
import { supabase, isConfigured } from './supabase.js'

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
