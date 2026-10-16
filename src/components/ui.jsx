import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

/* ---- Toast ---- */
const ToastCtx = createContext(() => {})
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('')
  const [show, setShow] = useState(false)
  const t = useRef()
  const toast = useCallback((m) => {
    setMsg(m); setShow(true); clearTimeout(t.current)
    t.current = setTimeout(() => setShow(false), 1700)
  }, [])
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className={'toast' + (show ? ' show' : '')}>{msg}</div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

/* ---- clipboard ---- */
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true }
  catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text; document.body.appendChild(ta); ta.select()
      document.execCommand('copy'); document.body.removeChild(ta); return true
    } catch { return false }
  }
}

/* ---- icons ---- */
export function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}
export function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}
export function ExitIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

/* ---- theme toggle (sun/moon icon) ---- */
function currentMode() {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'dark' || attr === 'light') return attr
  return matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'
}
export function ThemeToggle() {
  const [mode, setMode] = useState(currentMode)
  function toggle() {
    const next = mode === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    setMode(next)
    try { localStorage.setItem('theme', next) } catch { /* ignore */ }
  }
  return (
    <button className="icon-btn" type="button" onClick={toggle}
      title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle light or dark mode">
      {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

/* ---- modal ---- */
export function Modal({ children, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}
