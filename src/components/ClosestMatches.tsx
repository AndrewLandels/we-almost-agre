import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ASSET_CLASS_LABEL, getSymbol } from '../data/universe'
import {
  CADENCE_LEAD,
  CADENCE_SOON,
  CADENCE_TITLE,
  CHECK_IN_THIS,
  CLOSEST_EMPTY,
  CLOSEST_ERROR,
  CLOSEST_EYEBROW,
  CLOSEST_LENS,
  CLOSEST_LOADING,
  CLOSEST_TITLE,
  LONG_SHORT_NOTE,
  LONG_YES,
  NOTIFY_COMING,
  PAPER_TRACK_FRAMING,
  PAPER_TRACK_THIS,
  PING_HINT,
  PING_LABEL,
  PING_SAVED,
  POLYMARKET_RISK,
  POLYMARKET_VIEW,
  SHORT_NO,
} from '../lib/markets/copy'
import {
  composeLiveOptions,
  readPolymarketResponse,
  suggestCadence,
  type CheckInCadence,
  type LiveOption,
  type PolymarketMatch,
  type PolymarketSearchResult,
} from '../lib/markets/polymarket'
import type { ExpressionMapping } from '../lib/markets/types'

type Status = 'loading' | 'ready' | 'error'

const PING_KEY = 'waa-paper-ping'
const CADENCES: { id: CheckInCadence; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
]

function oddsClass(label: string): string {
  const name = label.toLowerCase()
  if (name === 'yes') return 'odds-chip yes'
  if (name === 'no') return 'odds-chip no'
  return 'odds-chip'
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

function isYesNo(match: PolymarketMatch): boolean {
  const labels = match.outcomes.map((outcome) => outcome.label.toLowerCase())
  return labels.includes('yes') && labels.includes('no')
}

function polymarketLabel(match: PolymarketMatch): string {
  const side = isYesNo(match) ? 'Yes/No bet' : 'Live bet'
  const origin = match.origin === 'trending' ? 'trending' : 'closest'
  return `${side} · ${origin}`
}

function resolveLabel(endDate: string | null): string | null {
  if (!endDate) return null
  const time = Date.parse(endDate)
  if (!Number.isFinite(time)) return null
  const text = new Date(time).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `Resolves ${text}`
}

function volumeLine(match: PolymarketMatch): string | null {
  if (!match.volumeLabel) return null
  if (match.volumeWindow === '24h') return `About ${match.volumeLabel} traded in the last day.`
  return `Volume about ${match.volumeLabel}.`
}

export function ClosestMatches({ mapping }: { mapping: ExpressionMapping }) {
  const [status, setStatus] = useState<Status>('loading')
  const [result, setResult] = useState<PolymarketSearchResult | null>(null)
  const [engagedId, setEngagedId] = useState<string | null>(null)
  const [cadence, setCadence] = useState<CheckInCadence>('weekly')
  const [email, setEmail] = useState('')
  const [pingNote, setPingNote] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setResult(null)
    setEngagedId(null)
    setCadence('weekly')
    setPingNote(null)

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
      : composeLiveOptions(
          status === 'ready' ? (result?.matches ?? []) : [],
          mapping.suggestions,
          status === 'ready' ? (result?.trends ?? []) : [],
        )

  const engaged = options.find((option) => option.id === engagedId) ?? null
  const engagedEnd = engaged?.kind === 'polymarket' ? engaged.match.endDate : null
  const soon = suggestCadence(engagedEnd) === 'daily'

  function engage(option: LiveOption) {
    setEngagedId(option.id)
    const end = option.kind === 'polymarket' ? option.match.endDate : null
    setCadence(suggestCadence(end))
    setPingNote(null)
  }

  function onNotify(event: FormEvent) {
    event.preventDefault()
    const payload = {
      email: email.trim(),
      cadence,
      statement: mapping.original,
      optionId: engagedId,
      savedAt: new Date().toISOString(),
    }
    try {
      window.localStorage.setItem(PING_KEY, JSON.stringify(payload))
    } catch {
      // Private mode can block storage. The note below still tells the truth.
    }
    setPingNote(PING_SAVED)
  }

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

      <div className="direction-explainer">
        <p>{LONG_YES}</p>
        <p>{SHORT_NO}</p>
        <p className="hint">{LONG_SHORT_NOTE}</p>
      </div>

      {status === 'loading' ? (
        <div className="closest-grid" role="status">
          {[0, 1, 2, 3, 4, 5].map((slot) => (
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
                <PolymarketCard
                  key={option.id}
                  match={option.match}
                  engaged={option.id === engagedId}
                  onEngage={() => engage(option)}
                />
              ) : (
                <EquityCard
                  key={option.id}
                  option={option}
                  statementId={mapping.id}
                  engaged={option.id === engagedId}
                  onEngage={() => engage(option)}
                />
              ),
            )}
          </div>
          <form className="cadence-panel" onSubmit={onNotify}>
            <div>
              <p className="eyebrow">{CADENCE_TITLE}</p>
              <h3>{PING_LABEL}</h3>
              <p className="muted">{soon && engaged ? CADENCE_SOON : CADENCE_LEAD}</p>
            </div>
            <div className="cadence-choices" role="radiogroup" aria-label="Check-in cadence">
              {CADENCES.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  role="radio"
                  aria-checked={cadence === choice.id}
                  className="preset"
                  onClick={() => {
                    setCadence(choice.id)
                    setPingNote(null)
                  }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
            <label className="field" htmlFor="paper-ping-email">
              Email for a later ping
            </label>
            <div className="ping-row">
              <input
                id="paper-ping-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button className="btn secondary" type="submit">
                {NOTIFY_COMING}
              </button>
            </div>
            <p className="hint">{pingNote ?? PING_HINT}</p>
          </form>
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

function PolymarketCard({
  match,
  engaged,
  onEngage,
}: {
  match: PolymarketMatch
  engaged: boolean
  onEngage: () => void
}) {
  const showEvent = match.eventTitle && match.eventTitle !== match.title
  const resolves = resolveLabel(match.endDate)
  const volume = volumeLine(match)
  return (
    <article className={engaged ? 'card poly-card engaged' : 'card poly-card'}>
      <span className={match.origin === 'trending' ? 'pill amber' : 'pill'}>{polymarketLabel(match)}</span>
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
      {volume ? <p className="hint">{volume}</p> : null}
      {resolves ? <p className="hint">{resolves}</p> : null}
      <p className="poly-actions">
        <button type="button" className="btn small" onClick={onEngage}>
          {CHECK_IN_THIS}
        </button>
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
  engaged,
  onEngage,
}: {
  option: Extract<LiveOption, { kind: 'equity' }>
  statementId: string
  engaged: boolean
  onEngage: () => void
}) {
  const symbol = getSymbol(option.symbolId)
  if (!symbol) return null
  return (
    <article className={engaged ? 'card poly-card engaged' : 'card poly-card'}>
      <span className="pill demo">Long/short · {ASSET_CLASS_LABEL[symbol.assetClass]}</span>
      <h3>
        {symbol.displaySymbol}
        <span className="paper-name"> · {symbol.name}</span>
      </h3>
      <p className="match-note">{option.note}</p>
      <p className="poly-actions">
        <button type="button" className="btn small" onClick={onEngage}>
          {CHECK_IN_THIS}
        </button>
        <Link className="btn secondary small" to={`/express/${statementId}?symbol=${symbol.id}`}>
          {PAPER_TRACK_THIS}
        </Link>
      </p>
    </article>
  )
}
