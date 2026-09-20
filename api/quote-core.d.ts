import type { MarketQuote, QuoteApiPayload } from '../src/lib/markets/types'

export const MAX_QUOTE_SYMBOLS: number
export const LIVE_DELAY_NOTE: string
export const NASDAQ_DELAY_NOTE: string
export const FALLBACK_AS_OF: string
export const FALLBACK_DELAY_NOTE: string

export function parseSymbolQuery(raw: string | null | undefined): string[]
export function parseSymbolsFromSearch(params: URLSearchParams): string[]
export function parseYahooChart(payload: unknown, symbolId: string): MarketQuote | null
export function parseNasdaqQuote(payload: unknown, symbolId: string): MarketQuote | null
export function fallbackQuote(symbolId: string): MarketQuote | undefined

export function fetchYahooQuote(
  yahooSymbol: string,
  symbolId?: string,
  fetchImpl?: typeof fetch,
): Promise<MarketQuote | null>

export function fetchNasdaqQuote(
  symbolId: string,
  fetchImpl?: typeof fetch,
): Promise<MarketQuote | null>

export function fetchYahooQuotes(
  symbols: Array<{ id: string; yahooSymbol: string }>,
  fetchImpl?: typeof fetch,
): Promise<MarketQuote[]>

export function buildQuotePayload(
  symbolIds: string[],
  fetchImpl?: typeof fetch,
): Promise<QuoteApiPayload>

export function handleQuoteRequest(
  request: Request,
  fetchImpl?: typeof fetch,
): Promise<Response>
