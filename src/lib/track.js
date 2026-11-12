import { supabase, isConfigured } from './supabase.js'

/* Landing-page tracking.

   What this records: that a visit happened, which call to action was
   clicked, and how long after arriving. Nothing else.

   What it deliberately does not record: no IP, no user agent, no cookie,
   no fingerprint, nothing that identifies a person or follows them off
   this page. The session id below is random, made fresh in the browser,
   and kept only in memory, so closing the tab ends it. It exists only so
   a click can be tied to the visit it came from. */

const SOURCES = [
  'instagram', 'discord', 'snapchat', 'facebook', 'tiktok', 'reddit',
  'whatsapp', 'imessage', 'email', 'qr', 'poster', 'supervised', 'direct', 'test',
]

let session = null
let startedAt = 0

export function startVisit() {
  if (session) return session
  session =
    'v_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  startedAt = Date.now()
  return session
}

/* Where the visit came from. Taken from ?src= so each platform gets its
   own link, falling back to the referring site's hostname, then 'direct'.
   Anything unrecognised is kept but trimmed, so a typo cannot become a
   way to store arbitrary text. */
export function readSource(search, referrer) {
  const raw = new URLSearchParams(search || '').get('src')
  if (raw) {
    const s = raw.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24)
    if (s) return SOURCES.includes(s) ? s : s
  }
  if (referrer) {
    try {
      const h = new URL(referrer).hostname.replace(/^www\./, '')
      if (h && h !== window.location.hostname) return h.slice(0, 24)
    } catch { /* malformed referrer, ignore */ }
  }
  return 'direct'
}

export async function track(event, { label = null, source = 'direct', variant = null } = {}) {
  if (!session) startVisit()
  const row = {
    session,
    source,
    event,
    label,
    ms: Math.max(0, Date.now() - startedAt),
    variant,
  }
  if (!isConfigured) { console.warn('[track] not configured, would record:', row); return }
  try {
    const { error } = await supabase.from('landing_events').insert(row)
    // Never let a tracking failure break the page for a visitor.
    if (error) console.warn('[track] not recorded:', error.message)
  } catch (e) {
    console.warn('[track] threw:', e?.message || e)
  }
}

export const trackingSources = SOURCES
