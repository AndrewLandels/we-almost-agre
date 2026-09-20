import { fallbackQuotesFor } from '../../data/fallbackQuotes'
import { getSymbol } from '../../data/universe'
import type { MarketQuote, QuoteApiPayload } from './types'

const CACHE_KEY = 'waa.quotes.v1'

export function quotesById(quotes: MarketQuote[]): Record<string, MarketQuote> {
  return Object.fromEntries(quotes.map((quote) => [quote.symbolId, quote]))
}

export function loadCachedQuotes(): Record<string, MarketQuote> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as MarketQuote[]
    return Array.isArray(parsed) ? quotesById(parsed) : {}
  } catch {
    return {}
  }
}

export function saveCachedQuotes(quotes: MarketQuote[]): void {
  if (typeof window === 'undefined') return
  const current = loadCachedQuotes()
  const next = { ...current, ...quotesById(quotes) }
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(Object.values(next)))
}

export function localFallbackPayload(symbolIds: string[]): QuoteApiPayload {
  const quotes = fallbackQuotesFor(symbolIds)
  return {
    quotes,
    missing: symbolIds.filter((id) => !quotes.some((quote) => quote.symbolId === id)),
    fallbackUsed: true,
    asOf: quotes[0]?.asOf ?? new Date().toISOString(),
  }
}

export async function fetchQuotes(symbolIds: string[]): Promise<QuoteApiPayload> {
  const unique = [...new Set(symbolIds.map((id) => id.toUpperCase()).filter((id) => getSymbol(id)))]
  if (!unique.length) {
    return { quotes: [], missing: symbolIds, fallbackUsed: false, asOf: new Date().toISOString() }
  }

  try {
    const response = await fetch(`/api/quote?symbols=${encodeURIComponent(unique.join(','))}`)
    if (!response.ok) throw new Error(`Quote feed returned ${response.status}`)
    const payload = (await response.json()) as QuoteApiPayload
    if (!payload || !Array.isArray(payload.quotes)) throw new Error('Quote feed shape was unexpected.')
    if (payload.quotes.length) saveCachedQuotes(payload.quotes)
    return payload
  } catch {
    const cached = loadCachedQuotes()
    const fromCache = unique
      .map((id) => cached[id])
      .filter((quote): quote is MarketQuote => Boolean(quote))
    if (fromCache.length) {
      return {
        quotes: fromCache,
        missing: unique.filter((id) => !cached[id]),
        fallbackUsed: fromCache.some((quote) => quote.source === 'fallback'),
        asOf: fromCache[0]?.asOf ?? new Date().toISOString(),
      }
    }
    return localFallbackPayload(unique)
  }
}
