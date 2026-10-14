import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// If keys are missing, we export null and the app shows a friendly setup notice
// instead of crashing. This lets the UI run before Supabase is wired up.
export const supabase = (url && anon) ? createClient(url, anon) : null
export const isConfigured = Boolean(url && anon)
