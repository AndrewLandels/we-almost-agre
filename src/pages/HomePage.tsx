import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isMappable, mapExpression } from '../lib/markets/mapExpression'
import { saveExpression } from '../lib/storage'
import { usePageTitle } from '../lib/usePageTitle'

const FLAGSHIP = 'The US economy is going down the toilet.'

const EXAMPLES = [
  { id: 'us-economy-down', label: 'US economy', text: FLAGSHIP },
  { id: 'electric-vehicles', label: 'Electric cars', text: 'Electric cars are shit.' },
  { id: 'bitcoin', label: 'Bitcoin', text: 'You should invest in Bitcoin.' },
]

export function HomePage() {
  usePageTitle('We Almost Agree')
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submitStatement(text: string) {
    setError(null)
    try {
      const mapping = mapExpression(text)
      saveExpression(mapping)
      navigate(`/express/${mapping.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that statement.')
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    submitStatement(draft)
  }

  return (
    <div className="wrap">
      <section className="hero">
        <div>
          <p className="eyebrow">Paper expressions · fake money · real marks</p>
          <h1>Paste the gut sentence. See how that view is often expressed.</h1>
          <p className="lede">
            Leave the row with a blunt take — “the US economy is going down the toilet” — and put it
            on a paper line marked to a public price. Facts and mechanics only. Not a tip, not a
            dunk, not a broker.
          </p>
        </div>
        <form className="hero-card" onSubmit={onSubmit}>
          <label className="field" htmlFor="statement">
            Paste a gut statement
          </label>
          <textarea
            id="statement"
            className="claim-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={FLAGSHIP}
            maxLength={400}
          />
          <div className="form-row">
            <p className="hint">First-pass heuristic, labelled on the next page. Ready for a later model.</p>
            <button className="btn" type="submit" disabled={!isMappable(draft)}>
              See how this is often expressed
            </button>
          </div>
          {error ? <p className="alert">{error}</p> : null}
          <div className="example-row">
            <p className="hint">Or try a worked sentence</p>
            <div className="presets">
              {EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  className="preset"
                  onClick={() => {
                    setDraft(example.text)
                    submitStatement(example.text)
                  }}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>

      <div className="section-head">
        <div>
          <p className="eyebrow">How it works</p>
          <h2>Express the view. Track it on paper. Go deeper if you want.</h2>
        </div>
      </div>
      <div className="step-grid four">
        <article className="step">
          <strong>1. Paste the sentence</strong>
          <p>The blunt thing you said to a sibling or a mate — not a research note.</p>
        </article>
        <article className="step">
          <strong>2. Thin read</strong>
          <p>One shared premise and the leftover market expression, in plain English.</p>
        </article>
        <article className="step">
          <strong>3. Paper track</strong>
          <p>Fake money, long or short, marked to a delayed public price. No cash-out. No prizes.</p>
        </article>
        <article className="step">
          <strong>4. Go deeper</strong>
          <p>Optional: the older agreement maps, blog, and play-point stakes on contested claims.</p>
        </article>
      </div>

      <div className="section-head">
        <div>
          <p className="eyebrow">Go deeper</p>
          <h2>Maps, notes, and the old play-point table</h2>
        </div>
        <p className="muted">Still here. Not required before you paper-track a view.</p>
      </div>
      <div className="seed-grid deeper-grid">
        <Link className="seed-card" to="/deeper">
          <span className="pill">Agreement maps</span>
          <blockquote>Shared premises versus the leftover claim</blockquote>
          <p>The original Venn maps, including the spicy seed sentences.</p>
        </Link>
        <Link className="seed-card" to="/blog">
          <span className="pill">Blog</span>
          <blockquote>Pitch and worked examples</blockquote>
          <p>Short essays in the same warm register. No buy tips.</p>
        </Link>
        <Link className="seed-card" to="/leaderboard">
          <span className="pill">Leaderboard</span>
          <blockquote>Play points on contested claims</blockquote>
          <p>A local table for the map stakes — separate from the paper book.</p>
        </Link>
      </div>
    </div>
  )
}
