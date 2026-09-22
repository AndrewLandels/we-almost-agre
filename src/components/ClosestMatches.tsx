import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ASSET_CLASS_LABEL, getSymbol } from '../data/universe'
import {
  CLOSEST_EMPTY,
  CLOSEST_ERROR,
  CLOSEST_EYEBROW,
  CLOSEST_LENS,
  CLOSEST_LOADING,
  CLOSEST_TITLE,
  PAPER_TRACK_FRAMING,
  PAPER_TRACK_THIS,
  POLYMARKET_RISK,
  POLYMARKET_VIEW,
} from '../lib/markets/copy'
import {
  composeLiveOptions,
  readPolymarketResponse,
  type LiveOption,
  type PolymarketMatch,
  type PolymarketSearchResult,
} from '../lib/markets/polymarket'
import type { ExpressionMapping } from '../lib/markets/types'

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

export function ClosestMatches({ mapping }: { mapping: ExpressionMapping }) {
  const [status, setStatus] = useState<Status>('loading')
  const [result, setResult] = useState<PolymarketSearchResult | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setResult(null)

    const params = new URLSearchParams({ q: mapping.original })
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
  }, [mapping.original])

  const options =
    status === 'loading'
      ? []
      : composeLiveOptions(status === 'ready' ? (result?.matches ?? []) : [], mapping.suggestions)

  return (
    <section className="closest-matches" aria-labelledby="closest-title" aria-busy={status === 'loading'}>
      <div className="section-head tight">
        <div>
          <p className="eyebrow">{CLOSEST_EYEBROW}</p>
          <h2 id="closest-title" tabIndex={-1}>
            {CLOSEST_TITLE}
          </h2>
        </div>
      </div>
      <p className="muted">
        {CLOSEST_LENS} {POLYMARKET_RISK}
      </p>

      {status === 'loading' ? (
        <div className="closest-grid" role="status">
          {[0, 1, 2].map((slot) => (
            <article key={slot} className="card poly-card match-skeleton" aria-hidden="true">
              <span className="pill">Live match</span>
              <p className="hint">{CLOSEST_LOADING}</p>
            </article>
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <p className="alert" role="alert">
          {CLOSEST_ERROR}
        </p>
      ) : null}

      {status !== 'loading' && options.length === 0 ? (
        <p className="alert notice" role="status">
          {CLOSEST_EMPTY}
          {result?.query ? ` Searched live markets for “${result.query}”.` : ''}
        </p>
      ) : null}

      {options.length > 0 ? (
        <>
          {result?.query ? <p className="hint">Searched live markets for “{result.query}”.</p> : null}
          <div className="closest-grid">
            {options.map((option) =>
              option.kind === 'polymarket' ? (
                <PolymarketCard key={option.id} match={option.match} />
              ) : (
                <EquityCard key={option.id} option={option} statementId={mapping.id} />
              ),
            )}
          </div>
        </>
      ) : null}

      <p className="muted closest-paper">{PAPER_TRACK_FRAMING}</p>
      <p>
        <Link className="btn secondary small" to={`/express/${mapping.id}`}>
          Open the full paper page
        </Link>
      </p>
    </section>
  )
}

function PolymarketCard({ match }: { match: PolymarketMatch }) {
  const showEvent = match.eventTitle && match.eventTitle !== match.title
  return (
    <article className="card poly-card">
      <span className="pill">Polymarket</span>
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

function EquityCard({
  option,
  statementId,
}: {
  option: Extract<LiveOption, { kind: 'equity' }>
  statementId: string
}) {
  const symbol = getSymbol(option.symbolId)
  if (!symbol) return null
  return (
    <article className="card poly-card">
      <span className="pill amber">{ASSET_CLASS_LABEL[symbol.assetClass]}</span>
      <h3>
        {symbol.displaySymbol}
        <span className="paper-name"> · {symbol.name}</span>
      </h3>
      <p className="match-note">{option.note}</p>
      <p className="poly-actions">
        <Link className="btn small" to={`/express/${statementId}?symbol=${symbol.id}`}>
          {PAPER_TRACK_THIS}
        </Link>
      </p>
    </article>
  )
}
