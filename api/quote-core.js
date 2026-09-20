/**
 * Shared quote API used by the Vercel function and the Vite dev plugin.
 * Kept as plain ESM JavaScript so Vercel does not have to resolve `src/*.ts`.
 */

export const MAX_QUOTE_SYMBOLS = 24

export const LIVE_DELAY_NOTE =
  'Public delayed mark via Yahoo Finance chart data — not a broker quote, and not an executable price.'

export const NASDAQ_DELAY_NOTE =
  'Public delayed mark via Nasdaq public quote — not a broker quote, and not an executable price.'

export const FALLBACK_AS_OF = '2026-09-19T16:00:00.000Z'

export const FALLBACK_DELAY_NOTE =
  'Demo/fallback marks from a stored delayed snapshot — not a live broker quote. The public feed was unavailable.'

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const JSON_HEADERS = {
  'User-Agent': BROWSER_UA,
  Accept: 'application/json,text/plain,*/*',
}

const YAHOO_CHART_HOSTS = [
  'https://query1.finance.yahoo.com',
  'https://query2.finance.yahoo.com',
]

const SNAPSHOT = {
  SPY: { price: 761.69, previousClose: 764.29 },
  QQQ: { price: 721.45, previousClose: 714.88 },
  IWM: { price: 284.1, previousClose: 288.89 },
  DIA: { price: 515.88, previousClose: 525.79 },
  EWU: { price: 47.27, previousClose: 47.94 },
  EWG: { price: 42.15, previousClose: 42.87 },
  EWJ: { price: 97.0, previousClose: 98.56 },
  AAPL: { price: 336.13, previousClose: 332.27 },
  MSFT: { price: 493.78, previousClose: 495.63 },
  GOOGL: { price: 349.54, previousClose: 338.5 },
  AMZN: { price: 253.71, previousClose: 256.78 },
  META: { price: 665.75, previousClose: 648.03 },
  NVDA: { price: 222.27, previousClose: 218.29 },
  TSLA: { price: 364.27, previousClose: 365.44 },
  JPM: { price: 349.67, previousClose: 356.23 },
  XOM: { price: 163.54, previousClose: 165.99 },
  JNJ: { price: 269.99, previousClose: 265.58 },
  V: { price: 368.29, previousClose: 370.45 },
  UNH: { price: 376.9, previousClose: 379.09 },
  GLD: { price: 401.17, previousClose: 398.77 },
  SLV: { price: 59.93, previousClose: 58.12 },
  USO: { price: 153.82, previousClose: 154.9 },
  CPER: { price: 40.23, previousClose: 39.18 },
  IBIT: { price: 46.02, previousClose: 43.77 },
}

export function parseSymbolQuery(raw) {
  if (!raw) return []
  const ids = raw
    .split(',')
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean)
  return [...new Set(ids)].slice(0, MAX_QUOTE_SYMBOLS)
}

export function parseSymbolsFromSearch(params) {
  return parseSymbolQuery(params.get('symbols') ?? params.get('symbol'))
}

export function parseYahooChart(payload, symbolId) {
  const meta = payload?.chart?.result?.[0]?.meta
  const price = meta?.regularMarketPrice
  if (!meta || !Number.isFinite(price) || price <= 0) return null

  const previous = meta.chartPreviousClose ?? meta.previousClose
  const asOf = meta.regularMarketTime
    ? new Date(meta.regularMarketTime * 1000).toISOString()
    : new Date().toISOString()

  return {
    symbolId,
    price,
    previousClose: Number.isFinite(previous) ? previous : undefined,
    currency: meta.currency ?? 'USD',
    asOf,
    source: 'live-delayed',
    delayNote: LIVE_DELAY_NOTE,
  }
}

function parseSignedNumber(raw) {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw !== 'string' || raw === 'N/A') return null
  const value = Number(raw.replace(/[$,+]/g, ''))
  return Number.isFinite(value) ? value : null
}

function parsePositivePrice(raw) {
  const value = parseSignedNumber(raw)
  return value != null && value > 0 ? value : null
}

export function parseNasdaqQuote(payload, symbolId) {
  const primary = payload?.data?.primaryData
  const price = parsePositivePrice(primary?.lastSalePrice)
  if (!price) return null

  const change = parseSignedNumber(primary?.netChange)
  const previousClose = change != null ? price - change : undefined
  const stamped = primary?.lastTradeTimestamp
    ? Date.parse(primary.lastTradeTimestamp)
    : Number.NaN

  return {
    symbolId,
    price,
    previousClose: previousClose != null && previousClose > 0 ? previousClose : undefined,
    currency: primary?.currency || 'USD',
    asOf: Number.isFinite(stamped) ? new Date(stamped).toISOString() : new Date().toISOString(),
    source: 'live-delayed',
    delayNote: NASDAQ_DELAY_NOTE,
  }
}

export function fallbackQuote(symbolId) {
  const row = SNAPSHOT[symbolId.toUpperCase()]
  if (!row) return undefined
  return {
    symbolId: symbolId.toUpperCase(),
    price: row.price,
    previousClose: row.previousClose,
    currency: 'USD',
    asOf: FALLBACK_AS_OF,
    source: 'fallback',
    delayNote: FALLBACK_DELAY_NOTE,
  }
}

async function readJson(response) {
  const payload = await response.json()
  return payload
}

export async function fetchYahooQuote(
  yahooSymbol,
  symbolId = yahooSymbol,
  fetchImpl = fetch,
) {
  for (const host of YAHOO_CHART_HOSTS) {
    try {
      const url = `${host}/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=5d`
      const response = await fetchImpl(url, { headers: JSON_HEADERS })
      if (!response.ok) continue
      const quote = parseYahooChart(await readJson(response), symbolId)
      if (quote) return quote
    } catch {
      // try the next host
    }
  }
  return null
}

export async function fetchNasdaqQuote(symbolId, fetchImpl = fetch) {
  for (const assetClass of ['etf', 'stocks']) {
    try {
      const url = `https://api.nasdaq.com/api/quote/${encodeURIComponent(symbolId)}/info?assetclass=${assetClass}`
      const response = await fetchImpl(url, { headers: JSON_HEADERS })
      if (!response.ok) continue
      const quote = parseNasdaqQuote(await readJson(response), symbolId)
      if (quote) return quote
    } catch {
      // try the other asset class
    }
  }
  return null
}

export async function fetchYahooQuotes(symbols, fetchImpl = fetch) {
  const unique = new Map()
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

  return results.filter(Boolean)
}

async function fetchLiveQuote(symbolId, fetchImpl) {
  const yahoo = await fetchYahooQuote(symbolId, symbolId, fetchImpl)
  if (yahoo) return yahoo
  return fetchNasdaqQuote(symbolId, fetchImpl)
}

export async function buildQuotePayload(symbolIds, fetchImpl = fetch) {
  const quotes = []
  const missing = []
  let fallbackUsed = false

  const resolved = await Promise.all(
    symbolIds.map(async (id) => {
      try {
        const live = await fetchLiveQuote(id, fetchImpl)
        if (live) return live
      } catch {
        // fall through to the labelled snapshot
      }
      return fallbackQuote(id) ?? { missing: id }
    }),
  )

  for (const row of resolved) {
    if ('missing' in row) {
      missing.push(row.missing)
      continue
    }
    if (row.source === 'fallback') fallbackUsed = true
    quotes.push(row)
  }

  const asOf = quotes[0]?.asOf ?? new Date().toISOString()
  return { quotes, missing, fallbackUsed, asOf }
}

function jsonResponse(body, status, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  })
}

export async function handleQuoteRequest(request, fetchImpl = fetch) {
  try {
    if (request.method && request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405)
    }

    const url = new URL(request.url)
    const symbols = parseSymbolsFromSearch(url.searchParams)
    if (!symbols.length) {
      return jsonResponse(
        {
          error: 'Pass symbols as a comma-separated list, e.g. ?symbols=SPY,GLD or ?symbol=SPY',
        },
        400,
      )
    }

    const payload = await buildQuotePayload(symbols, fetchImpl)
    return jsonResponse(payload, 200, { 'Cache-Control': 'public, max-age=30' })
  } catch (error) {
    return jsonResponse(
      {
        error: 'The public price feed could not be reached.',
        detail: error instanceof Error ? error.message : 'unknown',
      },
      502,
    )
  }
}
