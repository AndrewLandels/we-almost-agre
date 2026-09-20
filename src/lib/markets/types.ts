export type AssetClass = 'index' | 'stock' | 'commodity' | 'crypto'

export type QuoteVehicle = 'etf' | 'stock' | 'etf-proxy'

export type UniverseSymbol = {
  id: string
  yahooSymbol: string
  displaySymbol: string
  name: string
  assetClass: AssetClass
  quoteVehicle: QuoteVehicle
  /** Plain-English note so the UI never hides that an ETF is standing in for an index or metal. */
  vehicleNote: string
  keywords: string[]
  region?: string
}

export type QuoteSource = 'live-delayed' | 'fallback'

export type MarketQuote = {
  symbolId: string
  price: number
  previousClose?: number
  currency: string
  asOf: string
  source: QuoteSource
  delayNote: string
}

export type ExpressionSuggestion = {
  symbolId: string
  note: string
}

export type MappingSource = 'curated' | 'heuristic'

export type ExpressionMapping = {
  id: string
  original: string
  source: MappingSource
  firstPass: true
  topicLabel: string
  sharedPremise: string
  contestedExpression: string
  framing: string
  suggestions: ExpressionSuggestion[]
  relatedClaimId?: string
  relatedClaimLabel?: string
  relatedBlogSlug?: string
}

export type PaperSide = 'long' | 'short'

export type PaperPosition = {
  id: string
  symbolId: string
  side: PaperSide
  notional: number
  entryPrice: number
  openedAt: string
  statementId?: string
}

export type ClosedPaperPosition = PaperPosition & {
  exitPrice: number
  realisedPnl: number
  closedAt: string
}

export type PaperBook = {
  cash: number
  positions: PaperPosition[]
  closed: ClosedPaperPosition[]
  createdAt: string
}

export type InstrumentCategory = {
  id: string
  title: string
  definition: string
}
