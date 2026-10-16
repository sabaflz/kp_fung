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
