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

/* ---- theme toggle ---- */
export function ThemeToggle() {
  return (
    <button className="theme-btn" type="button" onClick={() => {
      const root = document.documentElement
      const cur = root.getAttribute('data-theme')
      const sysDark = matchMedia('(prefers-color-scheme:dark)').matches
      const next = cur ? (cur === 'dark' ? 'light' : 'dark') : (sysDark ? 'light' : 'dark')
      root.setAttribute('data-theme', next)
    }}>Theme</button>
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
