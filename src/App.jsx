import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth, signOut } from './lib/auth.jsx'
import { isViewer } from './lib/team.js'
import { ThemeToggle, ExitIcon, useToast, copyText } from './components/ui.jsx'
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

/* Section icons + hamburger (no icon library). */
const ICON = {
  goal: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>,
  bets: <><path d="M3 17l6-6 4 4 7-7" /><path d="M17 8h4v4" /></>,
  interviews: <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />,
  findings: <><path d="M3 3v18h18" /><path d="M7 16v2M12 11v7M17 7v11" /></>,
  market: <path d="M3 21h18M5 21V8l7-5 7 5v13M10 21v-6h4v6" />,
  burger: <path d="M4 6h16M4 12h16M4 18h16" />,
}
function Ico({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON[name]}</svg>
  )
}

const SECTIONS = [
  ['/', 'Goal', 'goal'],
  ['/bets', 'Bets', 'bets'],
  ['/interviews', 'Interviews', 'interviews'],
  ['/findings', 'Findings', 'findings'],
  ['/market', 'Market', 'market'],
]
const titleFor = (p) =>
  p === '/' ? 'Goal' :
  p.startsWith('/bets') ? 'Bets' :
  p.startsWith('/interviews') ? 'Interviews' :
  p.startsWith('/findings') ? 'Findings' :
  p.startsWith('/market') ? 'Market' : ''

function SectionNav({ tabs }) {
  if (tabs.length < 2) return <Outlet />
  return (
    <>
      <nav className="subnav">
        {tabs.map(([to, label]) => (<NavLink key={to} to={to} end>{label}</NavLink>))}
      </nav>
      <Outlet />
    </>
  )
}

export default function App() {
  const { session, loading } = useAuth()
  const location = useLocation()
  const toast = useToast()
  const [navOpen, setNavOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 860 : true))

  // Public, standalone package-choice survey: no nav, no sign-in.
  if (location.pathname.startsWith('/packages')) return <Packages />

  if (loading) return <div className="center"><span className="spin" /></div>
  if (!session) return <Login />

  const email = session.user?.email || ''
  const viewer = isViewer(email)
  const closeOnMobile = () => { if (typeof window !== 'undefined' && window.innerWidth <= 860) setNavOpen(false) }
  const copySurvey = async () => {
    const url = (typeof window !== 'undefined' ? window.location.origin : '') + '/packages'
    toast((await copyText(url)) ? 'Survey link copied' : 'Copy failed')
  }

  const interviewTabs = viewer
    ? [['/interviews/log', 'Log']]
    : [['/interviews/run', 'Run'], ['/interviews/sets', 'Question sets'], ['/interviews/log', 'Log']]
  const findingsTabs = [['/findings', 'Overview'], ['/findings/synthesis', 'Synthesis'], ['/findings/survey', 'Survey']]

  return (
    <div className={'layout' + (navOpen ? '' : ' nav-closed')}>
      {navOpen && <div className="nav-scrim" onClick={() => setNavOpen(false)} />}

      <aside className="sidebar">
        <Link to="/" className="side-brand" onClick={closeOnMobile}>
          <span className="side-mark">KP Benefits</span>
          <span className="side-sub">Fung &times; KP research</span>
        </Link>
        <nav className="side-nav">
          {SECTIONS.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className="side-link" onClick={closeOnMobile}>
              <Ico name={icon} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar2">
          <button className="burger" type="button" onClick={() => setNavOpen((v) => !v)}
            title={navOpen ? 'Hide menu' : 'Show menu'} aria-label="Toggle menu">
            <Ico name="burger" size={20} />
          </button>
          <span className="topbar2-title">{titleFor(location.pathname)}</span>
          <div className="topbar2-actions">
            <button className="pill-btn" type="button" onClick={copySurvey} title="Copy the public survey link">
              Copy survey link
            </button>
            {viewer && <span className="who-badge view-badge">View only</span>}
            <span className="who-badge email-badge" title={email}>{email}</span>
            <ThemeToggle />
            <button className="icon-btn" type="button" onClick={signOut} title="Sign out" aria-label="Sign out">
              <ExitIcon />
            </button>
          </div>
        </header>

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
