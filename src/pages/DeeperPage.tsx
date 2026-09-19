import { Link } from 'react-router-dom'
import { SEED_CLAIMS } from '../data/seeds'
import { usePageTitle } from '../lib/usePageTitle'

export function DeeperPage() {
  usePageTitle('Go deeper · We Almost Agree')

  return (
    <div className="wrap">
      <p className="eyebrow">Optional layer</p>
      <h1>Go deeper</h1>
      <p className="lede">
        The front door is now statement → paper market-expression. These maps, notes, and play-point
        stakes are still here if you want the fuller split — shared premises, contested leftovers,
        and a Venn glance.
      </p>

      <div className="section-head">
        <div>
          <p className="eyebrow">Seed maps</p>
          <h2>Three heated sentences, already split</h2>
        </div>
        <p className="muted">Start here if you want the curated evidence trail.</p>
      </div>

      <div className="seed-grid">
        {SEED_CLAIMS.map((claim) => (
          <Link key={claim.id} className="seed-card" to={`/claim/${claim.id}`}>
            <span className="pill">{claim.topicLabel}</span>
            <blockquote>“{claim.original}”</blockquote>
            <div
              className="overlap-bar"
              role="img"
              aria-label={`${claim.overlapScore} percent already shared`}
            >
              <span style={{ width: `${claim.overlapScore}%` }} />
            </div>
            <p>
              {claim.sharedPremises.length} shared · {claim.contestedClaims.length} contested ·{' '}
              {claim.overlapScore}% overlap
            </p>
          </Link>
        ))}
      </div>

      <div className="section-head">
        <div>
          <p className="eyebrow">Also on this path</p>
          <h2>Notes and the play-point table</h2>
        </div>
      </div>
      <div className="seed-grid deeper-grid">
        <Link className="seed-card" to="/blog">
          <span className="pill">Blog</span>
          <blockquote>Pitch and worked examples</blockquote>
          <p>Short essays. Same tone. No dunking, and no buy tips.</p>
        </Link>
        <Link className="seed-card" to="/leaderboard">
          <span className="pill">Leaderboard</span>
          <blockquote>Play points on contested claims</blockquote>
          <p>Separate from the multi-asset paper book on the home-page loop.</p>
        </Link>
        <Link className="seed-card" to="/about">
          <span className="pill">About</span>
          <blockquote>Ethos and what this run leaves out</blockquote>
          <p>Not a tip sheet. Not a casino. Not a broker.</p>
        </Link>
      </div>
    </div>
  )
}
