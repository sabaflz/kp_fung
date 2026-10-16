import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles.css'
import { AuthProvider } from './lib/auth.jsx'
import { ToastProvider } from './components/ui.jsx'
import App from './App.jsx'

// Restore the viewer's saved theme choice before first paint.
try {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') document.documentElement.setAttribute('data-theme', saved)
} catch { /* ignore */ }

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
