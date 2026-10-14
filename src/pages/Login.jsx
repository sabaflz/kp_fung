import { useState } from 'react'
import { signInWithEmail } from '../lib/auth.jsx'
import { isConfigured } from '../lib/supabase.js'
import { ThemeToggle } from '../components/ui.jsx'

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
          <p className="lede">The shared workspace for the Fung &times; KP supplemental-benefits research team. Sign in with your email to see the team&rsquo;s interviews and question sets.</p>

          {!isConfigured && (
            <div className="notice">
              Supabase is not connected yet. Add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (see the README), then reload.
            </div>
          )}

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
