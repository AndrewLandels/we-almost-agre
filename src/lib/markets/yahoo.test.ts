import { describe, expect, it } from 'vitest'
import {
  buildQuotePayload,
  handleQuoteRequest,
  parseNasdaqQuote,
  parseSymbolQuery,
  parseSymbolsFromSearch,
  parseYahooChart,
} from '../../../api/quote-core.js'

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

describe('nasdaq quote parser', () => {
  it('reads a delayed last-sale mark and previous close', () => {
    const quote = parseNasdaqQuote(
      {
        data: {
          primaryData: {
            lastSalePrice: '$761.69',
            netChange: '-0.91',
            lastTradeTimestamp: 'Sep 17, 2026',
            currency: null,
          },
        },
      },
      'SPY',
    )
    expect(quote?.price).toBe(761.69)
    expect(quote?.previousClose).toBeCloseTo(762.6)
    expect(quote?.source).toBe('live-delayed')
    expect(quote?.delayNote.toLowerCase()).toMatch(/nasdaq/)
  })

  it('returns null when the last sale is missing', () => {
    expect(parseNasdaqQuote({ data: { primaryData: { lastSalePrice: 'N/A' } } }, 'SPY')).toBeNull()
  })
})

describe('quote query parser', () => {
  it('dedupes, uppercases, and caps the batch', () => {
    expect(parseSymbolQuery('spy, SPY, gld')).toEqual(['SPY', 'GLD'])
    expect(parseSymbolQuery('')).toEqual([])
  })

  it('accepts both symbol and symbols search params', () => {
    expect(parseSymbolsFromSearch(new URLSearchParams('symbol=SPY'))).toEqual(['SPY'])
    expect(parseSymbolsFromSearch(new URLSearchParams('symbols=SPY,GLD'))).toEqual(['SPY', 'GLD'])
    expect(parseSymbolsFromSearch(new URLSearchParams('symbols=QQQ&symbol=SPY'))).toEqual(['QQQ'])
  })
})

describe('quote request handler', () => {
  it('returns 400 JSON when no symbol is passed', async () => {
    const response = await handleQuoteRequest(new Request('https://example.test/api/quote'))
    expect(response.status).toBe(400)
    const body = (await response.json()) as { error: string }
    expect(body.error).toMatch(/symbol/i)
  })

  it('returns 405 JSON for non-GET methods', async () => {
    const response = await handleQuoteRequest(
      new Request('https://example.test/api/quote?symbol=SPY', { method: 'POST' }),
    )
    expect(response.status).toBe(405)
  })

  it('returns a live Yahoo mark for ?symbol=SPY', async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input)
      expect(url).toContain('query1.finance.yahoo.com')
      return new Response(
        JSON.stringify({
          chart: {
            result: [
              {
                meta: {
                  regularMarketPrice: 761.69,
                  chartPreviousClose: 764.29,
                  currency: 'USD',
                  regularMarketTime: 1789761600,
                },
              },
            ],
          },
        }),
        { status: 200 },
      )
    }

    const response = await handleQuoteRequest(
      new Request('https://example.test/api/quote?symbol=SPY'),
      fetchImpl,
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.quotes[0].price).toBe(761.69)
    expect(body.quotes[0].source).toBe('live-delayed')
    expect(body.fallbackUsed).toBe(false)
  })

  it('falls back to Nasdaq when Yahoo is blocked', async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input)
      if (url.includes('finance.yahoo.com')) {
        return new Response('blocked', { status: 403 })
      }
      if (url.includes('api.nasdaq.com') && url.includes('assetclass=etf')) {
        return new Response(
          JSON.stringify({
            data: {
              primaryData: {
                lastSalePrice: '$761.69',
                netChange: '-0.91',
                lastTradeTimestamp: 'Sep 17, 2026',
              },
            },
          }),
          { status: 200 },
        )
      }
      return new Response('nope', { status: 404 })
    }

    const payload = await buildQuotePayload(['SPY'], fetchImpl)
    expect(payload.quotes[0]?.price).toBe(761.69)
    expect(payload.quotes[0]?.delayNote.toLowerCase()).toMatch(/nasdaq/)
    expect(payload.fallbackUsed).toBe(false)
  })

  it('uses the labelled snapshot when every live feed fails', async () => {
    const fetchImpl: typeof fetch = async () => new Response('down', { status: 503 })
    const payload = await buildQuotePayload(['SPY'], fetchImpl)
    expect(payload.quotes[0]?.price).toBe(761.69)
    expect(payload.quotes[0]?.source).toBe('fallback')
    expect(payload.fallbackUsed).toBe(true)
  })
})
