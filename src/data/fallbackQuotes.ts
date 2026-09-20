import { fallbackQuote } from '../../api/quote-core.js'
import type { MarketQuote } from '../lib/markets/types'

export { FALLBACK_AS_OF, FALLBACK_DELAY_NOTE, fallbackQuote } from '../../api/quote-core.js'

export function fallbackQuotesFor(symbolIds: string[]): MarketQuote[] {
  return symbolIds
    .map((id) => fallbackQuote(id))
    .filter((quote): quote is MarketQuote => Boolean(quote))
}
