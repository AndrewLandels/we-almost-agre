import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SEED_CLAIMS } from '../data/seeds'
import { analyzeClaim, isAnalyzable } from '../lib/analyzeClaim'
import { saveCustomClaim } from '../lib/storage'

export function HomePage() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      const analysis = analyzeClaim(draft)
      if (analysis.source === 'demo') {
        saveCustomClaim(analysis)
      }
      navigate(`/claim/${analysis.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that claim.')
    }
  }

  return (
    <div className="wrap">
      <section className="hero">
        <div>
          <p className="eyebrow">A calmer kind of argument</p>
          <h1>Find where you already agree. Test what&apos;s left.</h1>
          <p className="lede">
            Most public fights mix shared premises with a leftover claim. Paste a sentence — or pick
            a seed — and we will try to separate the two. Play-money points go only on what is still
            in dispute.
          </p>
        </div>
        <form className="hero-card" onSubmit={onSubmit}>
          <label className="field" htmlFor="claim">
            Paste a claim
          </label>
          <textarea
            id="claim"
            className="claim-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="e.g. Working from home is killing the city centre."
            maxLength={400}
          />
          <div className="form-row">
            <p className="hint">Free-text uses a labelled first-pass heuristic, ready for a later model.</p>
            <button className="btn" type="submit" disabled={!isAnalyzable(draft)}>
              Map this claim
            </button>
          </div>
          {error ? <p className="alert">{error}</p> : null}
        </form>
      </section>

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
          <p className="eyebrow">How it works</p>
          <h2>Shrink the perceived gap</h2>
        </div>
      </div>
      <div className="step-grid">
        <article className="step">
          <strong>1. Split the sentence</strong>
          <p>Shared premises stay on the table as common ground. Nobody stakes those.</p>
        </article>
        <article className="step">
          <strong>2. Look at the gap</strong>
          <p>Contested claims get a short, fair evidence trail — supports, challenges, context.</p>
        </article>
        <article className="step">
          <strong>3. Put points on the leftover</strong>
          <p>A thousand play points. For or against the disputed bit only. Then compare notes.</p>
        </article>
      </div>
    </div>
  )
}
