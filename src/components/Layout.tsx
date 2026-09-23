import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { usePaperBook } from '../hooks/usePaperBook'
import { formatUnits } from '../lib/markets/ledger'
import { DisclaimerBar } from './DisclaimerBar'

function BrandMark() {
  return (
    <svg className="mark" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1F2A24" />
      <circle cx="26" cy="32" r="14" fill="#3F6F5B" fillOpacity="0.92" />
      <circle cx="38" cy="32" r="14" fill="#C47A3A" fillOpacity="0.82" />
      <circle cx="32" cy="32" r="6.5" fill="#F6EFE4" />
    </svg>
  )
}

export function Layout() {
  const { equity } = usePaperBook()
  const onHome = useLocation().pathname === '/'

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="wrap header-inner">
          <NavLink to="/" className="brand" aria-label="We Almost Agree home">
            <BrandMark />
            <span>
              <span className="brand-name">We Almost Agree</span>
              {onHome ? null : <span className="brand-tag">Find where you already agree.</span>}
            </span>
          </NavLink>
          <div className="header-tools">
            <nav className="nav" aria-label="Primary">
              <NavLink to="/" end>
                Home
              </NavLink>
              <NavLink to="/book">Book</NavLink>
              <NavLink to="/deeper">Go deeper</NavLink>
            </nav>
            {onHome ? null : (
              <NavLink className="points-chip" to="/book" title="Paper book — fake money on a market expression">
                <span aria-hidden="true" />
                Book · {formatUnits(equity, 0)}
              </NavLink>
            )}
          </div>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="wrap footer-inner">
          <p>We Almost Agree · paper trading only · not a broker · wealmostagree.com</p>
          <nav className="footer-nav" aria-label="Secondary">
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/leaderboard">Leaderboard</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>
        </div>
      </footer>
      <DisclaimerBar />
    </div>
  )
}
