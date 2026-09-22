import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClosestMatches } from '../components/ClosestMatches'
import { isMappable, mapExpression } from '../lib/markets/mapExpression'
import { saveExpression } from '../lib/storage'
import { usePageTitle } from '../lib/usePageTitle'
import type { ExpressionMapping } from '../lib/markets/types'

const FLAGSHIP = 'The US economy is going down the toilet.'

const EXAMPLES = [
  { id: 'us-economy-down', label: 'US economy', text: FLAGSHIP },
  { id: 'electric-vehicles', label: 'Electric cars', text: 'Electric cars are shit.' },
  { id: 'bitcoin', label: 'Bitcoin', text: 'You should invest in Bitcoin.' },
]

export function HomePage() {
  usePageTitle('We Almost Agree')
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mapping, setMapping] = useState<ExpressionMapping | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapping) return
    const node = resultsRef.current
    const heading = node?.querySelector('h2')
    if (!node || !heading) return
    const top = heading.getBoundingClientRect().top
    if (top < 72 || top > window.innerHeight * 0.35) {
      node.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    if (heading instanceof HTMLElement) heading.focus({ preventScroll: true })
  }, [mapping])

  function submitStatement(text: string) {
    setError(null)
    try {
      const next = mapExpression(text)
      saveExpression(next)
      setMapping(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that statement.')
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    submitStatement(draft)
  }

  function onStatementKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    if (isMappable(draft)) submitStatement(draft)
  }

  return (
    <div className="wrap">
      {mapping ? (
        <div className="submitted-top" ref={resultsRef}>
          <p className="eyebrow">Your statement</p>
          <h1 className="result-statement">“{mapping.original}”</h1>
          <ClosestMatches mapping={mapping} />
          <form className="hero-card rematch" onSubmit={onSubmit}>
            <label className="field" htmlFor="statement">
              Edit the sentence
            </label>
            <div className="rematch-bar">
              <textarea
                id="statement"
                className="claim-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onStatementKeyDown}
                placeholder={FLAGSHIP}
                maxLength={400}
              />
              <button className="btn" type="submit" disabled={!isMappable(draft)}>
                See closest matches
              </button>
            </div>
            {error ? <p className="alert">{error}</p> : null}
            <div className="example-row">
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
        </div>
      ) : (
        <section className="hero">
          <div>
            <p className="eyebrow">Paper expressions · fake money · real marks</p>
            <h1>Paste the gut sentence. See how that view shows up.</h1>
            <p className="lede">
              Press Enter. The next thing you see is several live ways that view shows up — closest
              prediction markets, markets people are trading now, shares, indices, and similar bets.
              Facts and mechanics only. Not a tip, not a dunk, not a broker.
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
              onKeyDown={onStatementKeyDown}
              placeholder={FLAGSHIP}
              maxLength={400}
            />
            <div className="form-row">
              <p className="hint">Press Enter. Shift+Enter for a new line.</p>
              <button className="btn" type="submit" disabled={!isMappable(draft)}>
                See closest matches
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
      )}

      <div className="section-head">
        <div>
          <p className="eyebrow">How it works</p>
          <h2>Express the view. Track it on paper. Go deeper if you want.</h2>
        </div>
      </div>
      <div className="step-grid four">
        <article className="step">
          <strong>1. Paste the sentence</strong>
          <p>The blunt thing you said to a sibling or a mate — then press Enter.</p>
        </article>
        <article className="step">
          <strong>2. Closest live matches</strong>
          <p>
            Several ways the view shows up: closest prediction markets, markets trending today, a share,
            an index, or a similar bet.
          </p>
        </article>
        <article className="step">
          <strong>3. Paper track</strong>
          <p>
            Paper P&amp;L follows the expression you pick — a Polymarket market, a stock or index, a bet,
            or similar. Fake money. Not only an S&amp;P proxy. No cash-out. No prizes.
          </p>
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
        <p className="muted">Still here. Not required before you look at a live match.</p>
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
