import { describe, expect, it } from 'vitest'
import { parseSymbolQuery } from './quoteApi'
import { parseYahooChart } from './providers/yahoo'

describe('yahoo chart parser', () => {
  it('reads a delayed regular-market mark', () => {
    const quote = parseYahooChart(
      {
        chart: {
          result: [
            {
              meta: {
                regularMarketPrice: 761.69,
                chartPreviousClose: 764.29,
                currency: 'USD',
                regularMarketTime: 1789761600,
                symbol: 'SPY',
              },
            },
          ],
          error: null,
        },
      },
      'SPY',
    )
    expect(quote?.price).toBe(761.69)
    expect(quote?.source).toBe('live-delayed')
    expect(quote?.delayNote.toLowerCase()).toMatch(/not a broker/)
  })

  it('returns null when the payload is empty', () => {
    expect(parseYahooChart({ chart: { result: null, error: { description: 'Not found' } } }, 'NOPE')).toBeNull()
  })
})

describe('quote query parser', () => {
  it('dedupes, uppercases, and caps the batch', () => {
    expect(parseSymbolQuery('spy, SPY, gld')).toEqual(['SPY', 'GLD'])
    expect(parseSymbolQuery('')).toEqual([])
  })
})
