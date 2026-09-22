import { FormEvent, useState } from 'react'
import { ASSET_CLASS_LABEL, getSymbol } from '../data/universe'
import { usePaperBook } from '../hooks/usePaperBook'
import { MIN_PAPER_SIZE, PAPER_ONLY_LABEL, PAPER_SIZE_PRESETS } from '../lib/markets/copy'
import { formatSignedUnits, formatUnits, unrealisedPnl } from '../lib/markets/ledger'
import type { PaperSide } from '../lib/markets/types'

type Props = {
  symbolId: string
  statementId?: string
}

export function PaperTradePanel({ symbolId, statementId }: Props) {
  const { quotes, openPosition, closePosition, book, status, fallbackUsed, refresh } = usePaperBook()
  const symbol = getSymbol(symbolId)
  const quote = quotes[symbolId]
  const [side, setSide] = useState<PaperSide>('short')
  const [notional, setNotional] = useState(1000)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const openHere = book.positions.filter((position) => position.symbolId === symbolId)

  function onOpen(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setNote(null)
    try {
      openPosition({ symbolId, side, notional, statementId })
      setNote(
        `Paper ${side} of ${formatUnits(notional, 0)} units opened at ${formatUnits(quote?.price ?? 0)}. This is a simulation, not a broker order.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open that paper line.')
    }
  }

  if (!symbol) {
    return <p className="alert">That symbol is not in the starter universe yet.</p>
  }

  return (
    <section className="panel paper-panel" aria-labelledby="paper-title">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Paper book</p>
          <h2 id="paper-title">
            {symbol.displaySymbol}
            <span className="paper-name"> · {symbol.name}</span>
          </h2>
        </div>
        <span className={`pill ${fallbackUsed ? 'demo' : ''}`}>
          {status === 'loading' ? 'Refreshing marks…' : fallbackUsed ? 'Fallback marks' : 'Delayed public marks'}
        </span>
      </div>

      <p className="muted">{symbol.vehicleNote}</p>
      <p className="hint">{ASSET_CLASS_LABEL[symbol.assetClass]} · {PAPER_ONLY_LABEL}</p>

      <div className="mark-row">
        <div>
          <p className="eyebrow">Mark</p>
          <p className="mark-price">
            {quote ? formatUnits(quote.price) : '—'} <small>{quote?.currency ?? ''}</small>
          </p>
        </div>
        <div>
          <p className="eyebrow">Previous close</p>
          <p>{quote?.previousClose ? formatUnits(quote.previousClose) : '—'}</p>
        </div>
        <div>
          <p className="eyebrow">As of</p>
          <p>{quote ? new Date(quote.asOf).toLocaleString('en-GB') : 'Waiting for a mark'}</p>
        </div>
        <button className="btn secondary small" type="button" onClick={() => void refresh([symbolId])}>
          Refresh mark
        </button>
      </div>
      {quote ? <p className="hint">{quote.delayNote}</p> : null}

      <form className="stake-box" onSubmit={onOpen}>
        <p className="field">Open a paper position</p>
        <p className="hint">
          Fake money on this expression — a share, an index, or a similar listed proxy — marked to a
          public price. The same view can also show up as a prediction market or another bet. A paper
          long improves if the mark rises; a paper short improves if the mark falls. Nobody is placing
          that bet for you.
        </p>
        <div className="sides">
          <button
            type="button"
            className={`btn ${side === 'long' ? 'sage' : 'secondary'}`}
            onClick={() => setSide('long')}
          >
            Paper long
          </button>
          <button
            type="button"
            className={`btn ${side === 'short' ? 'amber' : 'secondary'}`}
            onClick={() => setSide('short')}
          >
            Paper short
          </button>
        </div>
        <div className="presets">
          {PAPER_SIZE_PRESETS.map((size) => (
            <button
              key={size}
              type="button"
              className={`preset ${notional === size ? 'active' : ''}`}
              onClick={() => setNotional(size)}
            >
              {size}
            </button>
          ))}
          <input
            type="number"
            min={MIN_PAPER_SIZE}
            step={50}
            value={notional}
            onChange={(event) => setNotional(Number(event.target.value))}
            aria-label="Paper size in play units"
          />
        </div>
        <button className="btn" type="submit" disabled={!quote}>
          Open paper {side}
        </button>
        {error ? <p className="alert">{error}</p> : null}
        {note ? <p className="alert success">{note}</p> : null}
      </form>

      {openHere.length ? (
        <div className="open-lines">
          <p className="eyebrow">Open paper lines on {symbol.displaySymbol}</p>
          {openHere.map((position) => {
            const pnl = quote ? unrealisedPnl(position, quote.price) : 0
            return (
              <article key={position.id} className="open-line">
                <div>
                  <strong>
                    {position.side} · {formatUnits(position.notional, 0)} units
                  </strong>
                  <p className="hint">
                    In at {formatUnits(position.entryPrice)} · open P&amp;L {formatSignedUnits(pnl)}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn secondary small"
                  onClick={() => closePosition(position.id)}
                >
                  Close paper line
                </button>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
