import type { MarketQuote } from '../lib/markets/types'

/** Snapshot delayed marks for when the live feed is unreachable. Labelled in the UI as demo/fallback. */
export const FALLBACK_AS_OF = '2026-09-19T16:00:00.000Z'

const SNAPSHOT: Record<string, { price: number; previousClose: number }> = {
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

export const FALLBACK_DELAY_NOTE =
  'Demo/fallback marks from a stored delayed snapshot — not a live broker quote. The public feed was unavailable.'

export function fallbackQuote(symbolId: string): MarketQuote | undefined {
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

export function fallbackQuotesFor(symbolIds: string[]): MarketQuote[] {
  return symbolIds
    .map((id) => fallbackQuote(id))
    .filter((quote): quote is MarketQuote => Boolean(quote))
}
