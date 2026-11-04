import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth, signOut } from './lib/auth.jsx'
import { isViewer } from './lib/team.js'
import { ThemeToggle, ExitIcon } from './components/ui.jsx'
import Login from './pages/Login.jsx'
import Run from './pages/Run.jsx'
import Interviews from './pages/Interviews.jsx'
import Sets from './pages/Sets.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Survey from './pages/Survey.jsx'
import Market from './pages/Market.jsx'
import Bet2 from './pages/Bet2.jsx'
import Packages from './pages/Packages.jsx'

// Full workspace for the team.
const TABS = [
  ['/', 'Run'],
  ['/interviews', 'Interviews'],
  ['/sets', 'Question sets'],
  ['/survey', 'Survey'],
  ['/dashboard', 'Dashboard'],
  ['/market', 'Market'],
  ['/bet2', 'Bet 2'],
]
// Read-only viewers see only the finished views (no interviewing tools).
const VIEWER_TABS = [
  ['/dashboard', 'Dashboard'],
  ['/survey', 'Survey'],
  ['/interviews', 'Interviews'],
  ['/market', 'Market'],
  ['/bet2', 'Bet 2'],
]

export default function App() {
  const { session, loading } = useAuth()
  const location = useLocation()

  // Public, standalone package-choice survey. Renders with no app navigation and
  // needs no sign-in, so anyone with the link sees only the survey. Every other
  // route stays behind the auth gate below, and the database rules protect the
  // real data regardless.
  if (location.pathname.startsWith('/packages')) return <Packages />

  if (loading) return <div className="center"><span className="spin" /></div>
  if (!session) return <Login />

  const email = session.user?.email || ''
  const viewer = isViewer(email)
  const tabs = viewer ? VIEWER_TABS : TABS

  return (
    <>
      <header className="topbar">
        <div className="inner">
          <div className="topline">
            <div className="brand">
              <span className="mark">Benefits Interview Kit</span>
              <span className="sub">Fung &times; KP Benefits</span>
            </div>
            <div className="right">
              {viewer && (
                <span className="who-badge" style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)', fontWeight: 600 }}>
                  View only
                </span>
              )}
              <span className="who-badge" title={email}>{email}</span>
              <ThemeToggle />
              <button className="icon-btn" type="button" onClick={signOut} title="Sign out" aria-label="Sign out">
                <ExitIcon />
              </button>
            </div>
          </div>
          <nav className="nav">
            {tabs.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="wrap">
        <Routes>
          {viewer ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/interviews" element={<Interviews />} />
              <Route path="/market" element={<Market />} />
              <Route path="/bet2" element={<Bet2 />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Run />} />
              <Route path="/interviews" element={<Interviews />} />
              <Route path="/sets" element={<Sets />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/market" element={<Market />} />
              <Route path="/bet2" element={<Bet2 />} />
              <Route path="/outreach" element={<Navigate to="/survey" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>

        <footer className="foot">
          <span>Fung Fellowship &middot; KP supplemental-benefits research</span>
          <span>Shared workspace &middot; live-synced across the team</span>
        </footer>
      </main>
    </>
  )
}
