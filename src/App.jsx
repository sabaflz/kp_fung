import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth, signOut } from './lib/auth.jsx'
import { ThemeToggle } from './components/ui.jsx'
import Login from './pages/Login.jsx'
import Run from './pages/Run.jsx'
import Interviews from './pages/Interviews.jsx'
import Sets from './pages/Sets.jsx'
import Dashboard from './pages/Dashboard.jsx'

const TABS = [
  ['/', 'Run'],
  ['/interviews', 'Interviews'],
  ['/sets', 'Question sets'],
  ['/dashboard', 'Dashboard'],
]

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return <div className="center"><span className="spin" /></div>
  if (!session) return <Login />

  const email = session.user?.email || ''

  return (
    <>
      <header className="topbar">
        <div className="inner">
          <div className="brand">
            <span className="mark">Benefits Interview Kit</span>
            <span className="sub">Fung &times; KP Benefits</span>
          </div>
          <nav className="nav">
            {TABS.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
            ))}
          </nav>
          <div className="right">
            <span className="who-badge">{email}</span>
            <ThemeToggle />
            <button className="btn ghost sm" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="wrap">
        <Routes>
          <Route path="/" element={<Run />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/sets" element={<Sets />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <footer className="foot">
          <span>Fung Fellowship &middot; KP supplemental-benefits research</span>
          <span>Shared workspace &middot; live-synced across the team</span>
        </footer>
      </main>
    </>
  )
}
