import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ASSET_CLASS_LABEL, getSymbol } from '../data/universe'
import { usePaperBook } from '../hooks/usePaperBook'
import {
  CLOSEST_EMPTY,
  CLOSEST_ERROR,
  CLOSEST_LOADING,
  CLOSEST_TITLE,
  LONG_SHORT_LINE,
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
import type { ExpressionMapping, PaperSide } from '../lib/markets/types'

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
        <h2 id="closest-title" tabIndex={-1}>
          {CLOSEST_TITLE}
        </h2>
      </div>

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

      {options.some((option) => option.kind === 'equity') ? (
        <p className="muted closest-paper">{LONG_SHORT_LINE}</p>
      ) : null}
      {options.some((option) => option.kind === 'polymarket') ? (
        <p className="hint closest-paper">{POLYMARKET_RISK}</p>
      ) : null}
      {status !== 'loading' ? (
        <p className="closest-more">
          <Link className="text-link" to={`/express/${mapping.id}`}>
            Full paper page
          </Link>
        </p>
      ) : null}
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
  return <EquityActions symbolId={symbol.id} note={option.note} statementId={statementId} />
}

function EquityActions({
  symbolId,
  note,
  statementId,
}: {
  symbolId: string
  note: string
  statementId: string
}) {
  const symbol = getSymbol(symbolId)
  const { quotes, openPosition, watchSymbols } = usePaperBook()
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    watchSymbols([symbolId])
  }, [symbolId, watchSymbols])

  if (!symbol) return null
  const quote = quotes[symbolId]

  function openSide(side: PaperSide) {
    setMessage(null)
    setFailed(false)
    try {
      openPosition({ symbolId, side, notional: 1000, statementId })
      setMessage(`Paper ${side} opened for 1,000 units. Not an order.`)
    } catch (err) {
      setFailed(true)
      setMessage(err instanceof Error ? err.message : 'Could not open that paper line.')
    }
  }

  return (
    <article className="card poly-card">
      <span className="pill amber">{ASSET_CLASS_LABEL[symbol.assetClass]}</span>
      <h3>
        {symbol.displaySymbol}
        <span className="paper-name"> · {symbol.name}</span>
      </h3>
      <p className="match-note">{note}</p>
      <div className="sides">
        <button
          type="button"
          className="btn sage small"
          onClick={() => openSide('long')}
          disabled={!quote}
        >
          Paper long
        </button>
        <button
          type="button"
          className="btn amber small"
          onClick={() => openSide('short')}
          disabled={!quote}
        >
          Paper short
        </button>
      </div>
      {!quote ? <p className="hint">Waiting for a paper mark.</p> : null}
      {message ? <p className={failed ? 'alert' : 'hint'}>{message}</p> : null}
    </article>
  )
}
