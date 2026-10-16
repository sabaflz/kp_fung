import { useState } from 'react'
import { signInWithEmail, signInWithGoogle } from '../lib/auth.jsx'
import { isConfigured } from '../lib/supabase.js'
import { ThemeToggle } from '../components/ui.jsx'

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr(''); setBusy(true)
    try { await signInWithEmail(email.trim()); setSent(true) }
    catch (e) { setErr(e.message || 'Could not send the link') }
    finally { setBusy(false) }
  }

  async function google() {
    setErr('')
    try { await signInWithGoogle() }
    catch (e) { setErr(e.message || 'Could not start Google sign-in') }
  }

  return (
    <div className="center">
      <div className="card" style={{ width: 'min(440px,100%)' }}>
        <div className="bd" style={{ display: 'grid', gap: 16 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="brand">
              <span className="mark" style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 22 }}>
                Benefits Interview Kit
              </span>
            </div>
            <ThemeToggle />
          </div>
          <p className="lede">The shared workspace for the Fung &times; KP supplemental-benefits research team. Sign in to see the team&rsquo;s interviews and question sets.</p>

          {!isConfigured && (
            <div className="notice">
              Supabase is not connected yet. Add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (see the README), then reload.
            </div>
          )}

          <button className="btn ghost" type="button" onClick={google} disabled={!isConfigured}
            style={{ justifyContent: 'center' }}>
            <GoogleIcon /> Continue with Google
          </button>

          <div className="row" style={{ gap: 10, color: 'var(--faint)', fontSize: 12 }}>
            <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            or email me a link
            <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          {sent ? (
            <div className="notice">Check your email. We sent a magic sign-in link to <b>{email}</b>. Open it on this device.</div>
          ) : (
            <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" className="inp" type="email" required
                  placeholder="you@berkeley.edu" value={email}
                  onChange={(e) => setEmail(e.target.value)} disabled={!isConfigured || busy} />
              </div>
              {err && <div style={{ color: 'var(--bad)', fontSize: 13 }}>{err}</div>}
              <button className="btn" type="submit" disabled={!isConfigured || busy}>
                {busy ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
