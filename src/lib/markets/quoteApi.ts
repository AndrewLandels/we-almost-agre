import { fallbackQuote } from '../../data/fallbackQuotes'
import { getSymbol } from '../../data/universe'
import { fetchYahooQuotes } from './providers/yahoo'
import type { MarketQuote } from './types'

export const MAX_QUOTE_SYMBOLS = 24

export function parseSymbolQuery(raw: string | null | undefined): string[] {
  if (!raw) return []
  const ids = raw
    .split(',')
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean)
  return [...new Set(ids)].slice(0, MAX_QUOTE_SYMBOLS)
}

export type QuoteApiPayload = {
  quotes: MarketQuote[]
  missing: string[]
  fallbackUsed: boolean
  asOf: string
}

export async function buildQuotePayload(
  symbolIds: string[],
  fetchImpl: typeof fetch = fetch,
): Promise<QuoteApiPayload> {
  const known = symbolIds
    .map((id) => getSymbol(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const live = known.length
    ? await fetchYahooQuotes(
        known.map((item) => ({ id: item.id, yahooSymbol: item.yahooSymbol })),
        fetchImpl,
      )
    : []

  const liveById = Object.fromEntries(live.map((quote) => [quote.symbolId, quote]))
  const quotes: MarketQuote[] = []
  const missing: string[] = []
  let fallbackUsed = false

  for (const id of symbolIds) {
    const liveQuote = liveById[id]
    if (liveQuote) {
      quotes.push(liveQuote)
      continue
    }
    const fallback = fallbackQuote(id)
    if (fallback) {
      quotes.push(fallback)
      fallbackUsed = true
      continue
    }
    missing.push(id)
  }

  const asOf = quotes[0]?.asOf ?? new Date().toISOString()
  return { quotes, missing, fallbackUsed, asOf }
}
