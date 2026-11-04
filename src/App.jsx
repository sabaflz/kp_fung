import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth, signOut } from './lib/auth.jsx'
import { isViewer } from './lib/team.js'
import { ThemeToggle, ExitIcon } from './components/ui.jsx'
import Login from './pages/Login.jsx'
import Goal from './pages/Goal.jsx'
import Bets from './pages/Bets.jsx'
import Bet2 from './pages/Bet2.jsx'
import Run from './pages/Run.jsx'
import Sets from './pages/Sets.jsx'
import Interviews from './pages/Interviews.jsx'
import Overview from './pages/Overview.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Survey from './pages/Survey.jsx'
import Market from './pages/Market.jsx'
import Packages from './pages/Packages.jsx'

// Left-sidebar sections (same for team and viewers; the viewer differences live
// inside the Interviews sub-tabs, where Run and Question sets are team-only).
const SECTIONS = [
  ['/', 'Goal'],
  ['/bets', 'Bets'],
  ['/interviews', 'Interviews'],
  ['/findings', 'Findings'],
  ['/market', 'Market'],
]

// Secondary nav shown at the top of a section's content.
function SectionNav({ tabs }) {
  if (tabs.length < 2) return <Outlet />
  return (
    <>
      <nav className="subnav">
        {tabs.map(([to, label]) => (
          <NavLink key={to} to={to} end>{label}</NavLink>
        ))}
      </nav>
      <Outlet />
    </>
  )
}

export default function App() {
  const { session, loading } = useAuth()
  const location = useLocation()

  // Public, standalone package-choice survey. Renders with no app navigation and
  // needs no sign-in, so a shared link exposes only the survey.
  if (location.pathname.startsWith('/packages')) return <Packages />

  if (loading) return <div className="center"><span className="spin" /></div>
  if (!session) return <Login />

  const email = session.user?.email || ''
  const viewer = isViewer(email)

  const interviewTabs = viewer
    ? [['/interviews/log', 'Log']]
    : [['/interviews/run', 'Run'], ['/interviews/sets', 'Question sets'], ['/interviews/log', 'Log']]
  const findingsTabs = [['/findings', 'Overview'], ['/findings/synthesis', 'Synthesis'], ['/findings/survey', 'Survey']]

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="side-brand">
          <span className="side-mark">KP Benefits</span>
          <span className="side-sub">Fung &times; KP research</span>
        </div>
        <nav className="side-nav">
          {SECTIONS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className="side-link">{label}</NavLink>
          ))}
        </nav>
        <div className="side-foot">
          {viewer && <span className="who-badge view-badge">View only</span>}
          <span className="who-badge" title={email}>{email}</span>
          <div className="side-foot-actions">
            <ThemeToggle />
            <button className="icon-btn" type="button" onClick={signOut} title="Sign out" aria-label="Sign out">
              <ExitIcon />
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="main-inner">
          <Routes>
            <Route path="/" element={<Goal />} />
            <Route path="/bets" element={<Bets />} />
            <Route path="/bets/2" element={<Bet2 />} />

            <Route path="/interviews" element={<SectionNav tabs={interviewTabs} />}>
              <Route index element={<Navigate to={viewer ? 'log' : 'run'} replace />} />
              {!viewer && <Route path="run" element={<Run />} />}
              {!viewer && <Route path="sets" element={<Sets />} />}
              <Route path="log" element={<Interviews />} />
              <Route path="*" element={<Navigate to={viewer ? 'log' : 'run'} replace />} />
            </Route>

            <Route path="/findings" element={<SectionNav tabs={findingsTabs} />}>
              <Route index element={<Overview />} />
              <Route path="synthesis" element={<Dashboard />} />
              <Route path="survey" element={<Survey />} />
              <Route path="*" element={<Navigate to="/findings" replace />} />
            </Route>

            <Route path="/market" element={<Market />} />

            {/* Redirects from the old flat paths */}
            <Route path="/run" element={<Navigate to="/interviews/run" replace />} />
            <Route path="/sets" element={<Navigate to="/interviews/sets" replace />} />
            <Route path="/dashboard" element={<Navigate to="/findings/synthesis" replace />} />
            <Route path="/survey" element={<Navigate to="/findings/survey" replace />} />
            <Route path="/bet2" element={<Navigate to="/bets/2" replace />} />
            <Route path="/outreach" element={<Navigate to="/findings/survey" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <footer className="foot">
            <span>Fung Fellowship &middot; KP supplemental-benefits research</span>
            <span>Shared workspace &middot; live-synced across the team</span>
          </footer>
        </div>
      </main>
    </div>
  )
}
