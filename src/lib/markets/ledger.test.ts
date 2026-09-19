import { describe, expect, it } from 'vitest'
import { closePaperPosition, defaultPaperBook, openPaperPosition, unrealisedPnl } from './ledger'

describe('paper ledger', () => {
  const now = new Date('2026-09-19T12:00:00.000Z')

  it('opens a long and marks profit when the price rises', () => {
    const opened = openPaperPosition(defaultPaperBook(now), {
      symbolId: 'SPY',
      side: 'long',
      notional: 1000,
      entryPrice: 100,
      id: 'pos-1',
      now,
    })
    expect(opened.cash).toBe(9000)
    expect(unrealisedPnl(opened.positions[0]!, 110)).toBeCloseTo(100)
  })

  it('marks a short as profitable when the price falls', () => {
    const opened = openPaperPosition(defaultPaperBook(now), {
      symbolId: 'SPY',
      side: 'short',
      notional: 1000,
      entryPrice: 100,
      id: 'pos-1',
      now,
    })
    expect(unrealisedPnl(opened.positions[0]!, 90)).toBeCloseTo(100)
    expect(unrealisedPnl(opened.positions[0]!, 110)).toBeCloseTo(-100)
  })

  it('returns notional plus realised P&L to cash on close', () => {
    const opened = openPaperPosition(defaultPaperBook(now), {
      symbolId: 'GLD',
      side: 'short',
      notional: 2000,
      entryPrice: 400,
      id: 'pos-g',
      now,
    })
    const closed = closePaperPosition(opened, 'pos-g', 380, now)
    expect(closed.positions).toHaveLength(0)
    expect(closed.closed[0]?.realisedPnl).toBeCloseTo(100)
    expect(closed.cash).toBeCloseTo(10100)
  })

  it('refuses a size larger than remaining paper cash', () => {
    expect(() =>
      openPaperPosition(defaultPaperBook(now), {
        symbolId: 'SPY',
        side: 'long',
        notional: 50_000,
        entryPrice: 100,
      }),
    ).toThrow(/enough paper cash/i)
  })
})
