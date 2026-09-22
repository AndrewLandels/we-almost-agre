import { useEffect, useState } from 'react'
import {
  POLYMARKET_EMPTY,
  POLYMARKET_ERROR,
  POLYMARKET_EYEBROW,
  POLYMARKET_LENS,
  POLYMARKET_LOADING,
  POLYMARKET_RISK,
  POLYMARKET_TITLE,
  POLYMARKET_VIEW,
} from '../lib/markets/copy'
import {
  readPolymarketResponse,
  type PolymarketMatch,
  type PolymarketSearchResult,
} from '../lib/markets/polymarket'

type Status = 'loading' | 'ready' | 'error'

function oddsClass(label: string): string {
  const name = label.toLowerCase()
  if (name === 'yes') return 'odds-chip yes'
  if (name === 'no') return 'odds-chip no'
  return 'odds-chip'
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export function PolymarketMatches({ statement }: { statement: string }) {
  const [status, setStatus] = useState<Status>('loading')
  const [result, setResult] = useState<PolymarketSearchResult | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setResult(null)

    const params = new URLSearchParams({ q: statement })
    fetch(`/api/polymarket?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Polymarket search returned ${response.status}`)
        return readPolymarketResponse(await response.json())
      })
      .then((payload) => {
        setResult(payload)
        setStatus('ready')
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return
        setStatus('error')
      })

    return () => controller.abort()
  }, [statement])

  return (
    <section aria-labelledby="polymarket-title" aria-busy={status === 'loading'}>
      <div className="section-head tight">
        <div>
          <p className="eyebrow">{POLYMARKET_EYEBROW}</p>
          <h2 id="polymarket-title">{POLYMARKET_TITLE}</h2>
        </div>
      </div>
      <p className="muted">{POLYMARKET_LENS}</p>
      <p className="hint">{POLYMARKET_RISK}</p>

      {status === 'loading' ? (
        <p className="alert notice" role="status">
          {POLYMARKET_LOADING}
        </p>
      ) : null}

      {status === 'error' ? (
        <p className="alert" role="alert">
          {POLYMARKET_ERROR}
        </p>
      ) : null}

      {status === 'ready' && result && result.matches.length === 0 ? (
        <p className="alert notice" role="status">
          {POLYMARKET_EMPTY}
          {result.query ? ` Searched live markets for “${result.query}”.` : ''}
        </p>
      ) : null}

      {status === 'ready' && result && result.matches.length > 0 ? (
        <>
          {result.query ? <p className="hint">Searched live markets for “{result.query}”.</p> : null}
          <div className="poly-grid">
            {result.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}

function MatchCard({ match }: { match: PolymarketMatch }) {
  const showEvent = match.eventTitle && match.eventTitle !== match.title
  return (
    <article className="card poly-card">
      <span className="pill">Open market</span>
      <h3>{match.title}</h3>
      {showEvent ? <p className="hint">{match.eventTitle}</p> : null}
      {match.outcomes.length ? (
        <div className="odds-row">
          {match.outcomes.map((outcome) => (
            <span key={outcome.label} className={oddsClass(outcome.label)}>
              {outcome.label}
              <strong>{outcome.percentLabel}</strong>
            </span>
          ))}
        </div>
      ) : (
        <p className="hint">Prices were not included with this result.</p>
      )}
      {match.volumeLabel ? <p className="hint">Volume about {match.volumeLabel}.</p> : null}
      <p className="poly-actions">
        <a
          className="btn secondary small"
          href={match.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${POLYMARKET_VIEW}: ${match.title} (opens in a new tab)`}
        >
          {POLYMARKET_VIEW}
        </a>
      </p>
    </article>
  )
}
