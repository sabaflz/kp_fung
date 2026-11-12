import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isConfigured } from './supabase.js'

const AuthCtx = createContext({ session: null, loading: true })

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <AuthCtx.Provider value={{ session, loading }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)

export async function signInWithEmail(email) {
  if (!isConfigured) throw new Error('Supabase not configured yet')
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  if (error) throw error
}

// Email + password, for people whose inbox never gets the magic link. Corporate
// mail (kp.org) tends to block or pre-open one-time links, and Supabase's
// built-in mailer only delivers to a short list of addresses. A password needs
// no email at all: the account is created for them in the Supabase dashboard.
export async function signInWithPassword(email, password) {
  if (!isConfigured) throw new Error('Supabase not configured yet')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    if (/invalid login credentials/i.test(error.message)) {
      throw new Error('That email and password do not match. Check with Saffron if you need a new password.')
    }
    throw error
  }
}

export async function signInWithGoogle() {
  if (!isConfigured) throw new Error('Supabase not configured yet')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) throw error
}

export async function signOut() {
  if (isConfigured) await supabase.auth.signOut()
}
