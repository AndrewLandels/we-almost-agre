import { NavLink, Outlet } from 'react-router-dom'
import { formatPoints } from '../lib/points'
import { useWallet } from '../hooks/useWallet'

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
  const { wallet } = useWallet()

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
              <span className="brand-tag">Find where you already agree.</span>
            </span>
          </NavLink>
          <div className="header-tools">
            <nav className="nav" aria-label="Primary">
              <NavLink to="/" end>
                Home
              </NavLink>
              <NavLink to="/leaderboard">Leaderboard</NavLink>
              <NavLink to="/about">About</NavLink>
            </nav>
            <span className="points-chip" title="Play-money points — not real cash">
              <span aria-hidden="true" />
              {formatPoints(wallet.balance)} pts
            </span>
          </div>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="wrap footer-inner">
          <p>We Almost Agree · play-money only · wealmostagree.com (DNS later)</p>
          <p>British English · no dunking · stakes on contested claims only</p>
        </div>
      </footer>
    </div>
  )
}
