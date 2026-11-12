import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, signOut } from './lib/auth.jsx'
import { isViewer, isOwner } from './lib/team.js'
import { ThemeToggle, ExitIcon, useToast, copyText } from './components/ui.jsx'
import Login from './pages/Login.jsx'
import Goal from './pages/Goal.jsx'
import Bets from './pages/Bets.jsx'
import BetDetail from './pages/BetDetail.jsx'
import Landing from './pages/Landing.jsx'
import Meetings from './pages/Meetings.jsx'
import Run from './pages/Run.jsx'
import Sets from './pages/Sets.jsx'
import Interviews from './pages/Interviews.jsx'
import Overview from './pages/Overview.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Survey from './pages/Survey.jsx'
import Market from './pages/Market.jsx'
import Packages from './pages/Packages.jsx'
import Deck from './pages/Deck.jsx'

/* Section icons + nav controls (no icon library). */
const ICON = {
  goal: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>,
  bets: <><path d="M3 17l6-6 4 4 7-7" /><path d="M17 8h4v4" /></>,
  interviews: <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />,
  findings: <><path d="M3 3v18h18" /><path d="M7 16v2M12 11v7M17 7v11" /></>,
  market: <path d="M3 21h18M5 21V8l7-5 7 5v13M10 21v-6h4v6" />,
  meetings: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  chevronLeft: <path d="M15 18l-6-6 6-6" />,
  chevronRight: <path d="M9 18l6-6-6-6" />,
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
  ['/meetings', 'Meetings', 'meetings'],
]

// The in-page Market sections, mirrored as left-nav shortcuts (ids match Market.jsx).
const MARKET_NAV = [
  ['opportunity', 'Gaps'],
  ['national', 'National'],
  ['california', 'California'],
  ['pricing', 'Pricing'],
  ['works', 'What works'],
  ['survey', 'Survey fit'],
  ['recommend', 'Recommendation'],
  ['sources', 'Sources'],
]

// Remounts the survey on "Start over" so every test run gets a fresh order.
function SurveyTest() {
  const [run, setRun] = useState(0)
  const navigate = useNavigate()
  return <Packages key={run} preview onRestart={() => setRun(run + 1)} onExit={() => navigate('/bets/2')} />
}

function sectionFor(p) {
  if (p.startsWith('/bets')) return SECTIONS[1]
  if (p.startsWith('/interviews')) return SECTIONS[2]
  if (p.startsWith('/findings')) return SECTIONS[3]
  if (p.startsWith('/market')) return SECTIONS[4]
  if (p.startsWith('/meetings')) return SECTIONS[5]
  return SECTIONS[0]
}

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

const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 860

export default function App() {
  const { session, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const [collapsed, setCollapsed] = useState(false)   // desktop: shrink sidebar to an icon rail
  const [drawerOpen, setDrawerOpen] = useState(false)  // mobile: slide-over drawer

  // Public, standalone package-choice survey: no nav, no sign-in.
  if (location.pathname.startsWith('/packages')) return <Packages />
  // Public landing page the flyer links to. No sign-in, like the survey.
  if (location.pathname.startsWith('/plan')) return <Landing />

  if (loading) return <div className="center"><span className="spin" /></div>
  if (!session) return <Login />

  const email = session.user?.email || ''
  const viewer = isViewer(email)

  // Owner-only test run of the public survey. Same screens, nothing saved.
  if (location.pathname.startsWith('/survey-test')) {
    return isOwner(email) ? <SurveyTest /> : <Navigate to="/" replace />
  }

  // Full-screen present mode: no sidebar or top bar, just the slides.
  if (location.pathname.startsWith('/present')) {
    const deckId = location.pathname.split('/')[2] || 'bet1'
    return <Deck deckId={deckId} />
  }

  const closeDrawer = () => setDrawerOpen(false)
  // The sidebar toggle and the top-bar icon both act: open/close the drawer on
  // mobile, collapse/expand the rail on desktop.
  const toggleNav = () => { if (isMobile()) setDrawerOpen((v) => !v); else setCollapsed((v) => !v) }
  const openNav = () => { if (isMobile()) setDrawerOpen(true); else setCollapsed((v) => !v) }

  const copySurvey = async () => {
    const url = (typeof window !== 'undefined' ? window.location.origin : '') + '/packages'
    toast((await copyText(url)) ? 'Survey link copied' : 'Copy failed')
  }

  // Jump to a Market section from the sidebar, navigating there first if needed.
  const goMarket = (id) => {
    closeDrawer()
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (location.pathname !== '/market') { navigate('/market'); setTimeout(scroll, 90) }
    else scroll()
  }

  const interviewTabs = viewer
    ? [['/interviews/log', 'Log']]
    : [['/interviews/run', 'Run'], ['/interviews/sets', 'Question sets'], ['/interviews/log', 'Log']]
  const findingsTabs = [['/findings', 'Overview'], ['/findings/synthesis', 'Synthesis'], ['/findings/survey', 'Survey']]

  const activeTo = sectionFor(location.pathname)[0]
  const currentIcon = sectionFor(location.pathname)[2]
  const currentTitle = sectionFor(location.pathname)[1]

  return (
    <div className={'layout' + (collapsed ? ' nav-collapsed' : '') + (drawerOpen ? ' drawer-open' : '')}>
      {drawerOpen && <div className="nav-scrim" onClick={closeDrawer} />}

      <aside className="sidebar">
        <div className="side-top">
          <Link to="/" className="side-brand" onClick={closeDrawer}>
            <span className="side-mark">KP Benefits</span>
            <span className="side-sub">Fung &times; KP research</span>
          </Link>
          <button className="side-toggle" type="button" onClick={toggleNav}
            title={collapsed ? 'Expand menu' : 'Collapse menu'} aria-label="Toggle menu">
            <Ico name={collapsed ? 'chevronRight' : 'chevronLeft'} size={18} />
          </button>
        </div>

        <nav className="side-nav">
          {SECTIONS.filter(([to]) => !(viewer && to === '/meetings')).map(([to, label, icon]) => {
            const active = activeTo === to
            return (
              <div key={to} className="side-item">
                <NavLink to={to} end={to === '/'} className="side-link" onClick={closeDrawer} title={label}>
                  <Ico name={icon} /><span className="side-label">{label}</span>
                </NavLink>

                {active && to === '/interviews' && (
                  <div className="side-subnav">
                    {interviewTabs.map(([t, l]) => (
                      <NavLink key={t} to={t} end className="side-sublink" onClick={closeDrawer}>{l}</NavLink>
                    ))}
                  </div>
                )}
                {active && to === '/findings' && (
                  <div className="side-subnav">
                    {findingsTabs.map(([t, l]) => (
                      <NavLink key={t} to={t} end className="side-sublink" onClick={closeDrawer}>{l}</NavLink>
                    ))}
                  </div>
                )}
                {active && to === '/market' && (
                  <div className="side-subnav">
                    {MARKET_NAV.map(([id, l]) => (
                      <button key={id} type="button" className="side-sublink" onClick={() => goMarket(id)}>{l}</button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar2">
          <button className="topbar2-ico" type="button" onClick={openNav}
            title={currentTitle} aria-label="Menu">
            <Ico name={currentIcon} size={20} />
          </button>
          <span className="topbar2-title">{currentTitle}</span>
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
            <Route path="/bets/:id" element={<BetDetail />} />
            <Route path="/flyer" element={<Navigate to="/bets/3" replace />} />

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
            {!viewer && <Route path="/meetings" element={<Meetings />} />}

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
