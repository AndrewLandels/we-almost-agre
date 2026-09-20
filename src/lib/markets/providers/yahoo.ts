import type { MarketQuote } from '../types'

export const LIVE_DELAY_NOTE =
  'Public delayed mark via Yahoo Finance chart data — not a broker quote, and not an executable price.'

type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number
        chartPreviousClose?: number
        previousClose?: number
        currency?: string
        regularMarketTime?: number
        symbol?: string
      }
    }>
    error?: { description?: string } | null
  }
}

export function parseYahooChart(payload: unknown, symbolId: string): MarketQuote | null {
  const body = payload as YahooChart
  const meta = body.chart?.result?.[0]?.meta
  const price = meta?.regularMarketPrice
  if (!meta || !Number.isFinite(price) || (price ?? 0) <= 0) return null

  const previous = meta.chartPreviousClose ?? meta.previousClose
  const asOf = meta.regularMarketTime
    ? new Date(meta.regularMarketTime * 1000).toISOString()
    : new Date().toISOString()

  return {
    symbolId,
    price: price as number,
    previousClose: Number.isFinite(previous) ? previous : undefined,
    currency: meta.currency ?? 'USD',
    asOf,
    source: 'live-delayed',
    delayNote: LIVE_DELAY_NOTE,
  }
}

export async function fetchYahooQuote(
  yahooSymbol: string,
  symbolId = yahooSymbol,
  fetchImpl: typeof fetch = fetch,
): Promise<MarketQuote | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    yahooSymbol,
  )}?interval=1d&range=5d`

  const response = await fetchImpl(url, {
    headers: {
      'User-Agent': 'WeAlmostAgreePaper/0.2 (educational simulator; delayed public marks)',
      Accept: 'application/json',
    },
  })
  if (!response.ok) return null
  const payload: unknown = await response.json()
  return parseYahooChart(payload, symbolId)
}

export async function fetchYahooQuotes(
  symbols: Array<{ id: string; yahooSymbol: string }>,
  fetchImpl: typeof fetch = fetch,
): Promise<MarketQuote[]> {
  const unique = new Map<string, { id: string; yahooSymbol: string }>()
  for (const symbol of symbols) {
    unique.set(symbol.id, symbol)
  }

  const results = await Promise.all(
    [...unique.values()].map(async (symbol) => {
      try {
        return await fetchYahooQuote(symbol.yahooSymbol, symbol.id, fetchImpl)
      } catch {
        return null
      }
    }),
  )

  return results.filter((quote): quote is MarketQuote => Boolean(quote))
}
