import { Link } from 'react-router-dom'
import { ASSET_CLASS_LABEL, getSymbol } from '../data/universe'
import { usePaperBook } from '../hooks/usePaperBook'
import { PAPER_ONLY_LABEL, STARTING_PAPER_CASH } from '../lib/markets/copy'
import { formatSignedUnits, formatUnits, unrealisedPnl } from '../lib/markets/ledger'
import { usePageTitle } from '../lib/usePageTitle'

export function BookPage() {
  usePageTitle('Paper book · We Almost Agree')
  const { book, quotes, equity, fallbackUsed, status, closePosition, resetBook, refresh } =
    usePaperBook()
  const openPnl = book.positions.reduce((sum, position) => {
    const mark = quotes[position.symbolId]?.price ?? position.entryPrice
    return sum + unrealisedPnl(position, mark)
  }, 0)

  return (
    <div className="wrap stack">
      <div>
        <p className="eyebrow">Shared paper ledger</p>
        <h1>Paper book</h1>
        <p className="lede">
          Fake-money P&amp;L for expressions of a view: shares, indices, commodity proxies, and similar
          listed markets, marked to a public price. Prediction markets sit alongside those expressions;
          their live prices stay on the venue. Not a single S&amp;P line. {PAPER_ONLY_LABEL}.
        </p>
      </div>

      <div className="book-stats">
        <article className="panel">
          <p className="eyebrow">Equity</p>
          <p className="mark-price">{formatUnits(equity, 0)}</p>
          <p className="hint">Cash plus marked open lines</p>
        </article>
        <article className="panel">
          <p className="eyebrow">Paper cash</p>
          <p className="mark-price">{formatUnits(book.cash, 0)}</p>
          <p className="hint">Started at {formatUnits(STARTING_PAPER_CASH, 0)}</p>
        </article>
        <article className="panel">
          <p className="eyebrow">Open P&amp;L</p>
          <p className="mark-price">{formatSignedUnits(openPnl)}</p>
          <p className="hint">
            {status === 'loading' ? 'Refreshing…' : fallbackUsed ? 'Fallback marks' : 'Delayed public marks'}
          </p>
        </article>
      </div>

      <div className="presets">
        <button className="btn secondary small" type="button" onClick={() => void refresh()}>
          Refresh marks
        </button>
        <button className="btn secondary small" type="button" onClick={resetBook}>
          Reset paper book
        </button>
        <Link className="btn small" to="/">
          Paste another statement
        </Link>
      </div>

      <section className="panel">
        <p className="eyebrow">Open lines</p>
        <h2>Across the starter universe</h2>
        {book.positions.length === 0 ? (
          <p className="muted">No open paper lines yet. Express a statement on the home page, or pick a symbol there.</p>
        ) : (
          <div className="book-table">
            {book.positions.map((position) => {
              const symbol = getSymbol(position.symbolId)
              const quote = quotes[position.symbolId]
              const mark = quote?.price ?? position.entryPrice
              const pnl = unrealisedPnl(position, mark)
              return (
                <article key={position.id} className="book-row">
                  <div>
                    <strong>
                      {position.symbolId} · {position.side}
                    </strong>
                    <p className="hint">
                      {symbol ? `${symbol.name} · ${ASSET_CLASS_LABEL[symbol.assetClass]}` : 'Unknown symbol'}
                    </p>
                    {symbol ? <p className="hint">{symbol.vehicleNote}</p> : null}
                  </div>
                  <div>
                    <p>{formatUnits(position.notional, 0)} units</p>
                    <p className="hint">
                      In {formatUnits(position.entryPrice)} → {formatUnits(mark)}
                    </p>
                  </div>
                  <div>
                    <strong>{formatSignedUnits(pnl)}</strong>
                    <button
                      type="button"
                      className="btn secondary small"
                      onClick={() => closePosition(position.id)}
                    >
                      Close
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {book.closed.length ? (
        <section className="panel">
          <p className="eyebrow">Closed lines</p>
          <h2>Realised paper P&amp;L</h2>
          <div className="book-table">
            {book.closed.slice(0, 12).map((position) => (
              <article key={`${position.id}-closed`} className="book-row">
                <div>
                  <strong>
                    {position.symbolId} · {position.side}
                  </strong>
                  <p className="hint">Closed {new Date(position.closedAt).toLocaleString('en-GB')}</p>
                </div>
                <div>
                  <p>
                    {formatUnits(position.entryPrice)} → {formatUnits(position.exitPrice)}
                  </p>
                </div>
                <div>
                  <strong>{formatSignedUnits(position.realisedPnl)}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
