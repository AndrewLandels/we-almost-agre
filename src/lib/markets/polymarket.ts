export type PolymarketOutcome = {
  label: string
  price: number
  percentLabel: string
}

export type PolymarketMatch = {
  id: string
  title: string
  eventTitle: string
  url: string
  outcomes: PolymarketOutcome[]
  volumeLabel: string | null
}

export type PolymarketSearchResult = {
  query: string
  matches: PolymarketMatch[]
}

export type EquityOption = {
  symbolId: string
  note: string
}

export type LiveOption =
  | { kind: 'polymarket'; id: string; match: PolymarketMatch }
  | { kind: 'equity'; id: string; symbolId: string; note: string }

const GAMMA_SEARCH = 'https://gamma-api.polymarket.com/public-search'
const EVENT_URL = 'https://polymarket.com/event'
const MAX_MATCHES = 3
const USER_AGENT = 'WeAlmostAgree/0.1 (educational market lens; +https://www.wealmostagree.com)'

const STOP = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
  'to', 'of', 'in', 'on', 'for', 'and', 'or', 'but', 'if', 'that', 'this', 'these', 'those',
  'it', 'its', 'my', 'your', 'our', 'their', 'we', 'you', 'they', 'i', 'he', 'she',
  'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall',
  'just', 'really', 'very', 'so', 'than', 'then', 'with', 'from', 'by', 'at', 'as',
  'into', 'about', 'over', 'under', 'again', 'here', 'there', 'when', 'what', 'who',
  'how', 'why', 'do', 'does', 'did', 'doing', 'have', 'has', 'had', 'not',
  'going', 'gonna', 'wanna', 'please', 'like',
  'invest', 'investing', 'investment', 'investments',
  'buy', 'sell', 'buying', 'selling', 'trade', 'trading', 'hold', 'holding',
  'shit', 'crap', 'fuck', 'fucking', 'damn', 'toilet',
  'totally', 'absolutely', 'obviously',
])

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value)
  return null
}

function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string' || !value.trim()) return []
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function stem(token: string): string {
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1)
  return token
}

function normalizeForTokens(text: string): string {
  return text
    .replace(/(\p{L})\.(?=\p{L})/gu, '$1')
    .replace(/(\d),(?=\d)/g, '$1')
    .replace(/[$£€]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function significantTokens(text: string): string[] {
  return normalizeForTokens(text)
    .split(' ')
    .map((token) => token.toLowerCase())
    .filter((token) => token && !STOP.has(token) && (/\d/.test(token) || token.length > 1))
    .map(stem)
}

/** Drop filler so a blunt sentence searches more like its topic. */
export function cleanStatementQuery(statement: string): string {
  const trimmed = statement.replace(/\s+/g, ' ').trim()
  if (!trimmed) return ''
  const kept = normalizeForTokens(trimmed)
    .split(' ')
    .filter((token) => {
      const lower = token.toLowerCase()
      if (!lower) return false
      if (/\d/.test(lower)) return true
      if (STOP.has(lower)) return false
      return lower.length > 1
    })
  const query = kept.join(' ').slice(0, 140).trim()
  if (query.length >= 3) return query
  return trimmed.slice(0, 140)
}

export function parseStatementParam(raw: string | null | undefined): string | null {
  if (!raw) return null
  const text = raw.replace(/\s+/g, ' ').trim()
  if (text.length < 2 || text.length > 400) return null
  return text
}

export function polymarketSearchUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    limit_per_type: '5',
    search_profiles: 'false',
    keep_closed_markets: '0',
  })
  return `${GAMMA_SEARCH}?${params.toString()}`
}

export function formatVolumeUsd(volume: number): string | null {
  if (!Number.isFinite(volume) || volume <= 0) return null
  const units = [
    { value: 1_000_000_000, suffix: 'bn' },
    { value: 1_000_000, suffix: 'm' },
    { value: 1_000, suffix: 'k' },
  ]
  for (const unit of units) {
    if (volume >= unit.value) {
      const scaled = volume / unit.value
      const digits = scaled >= 100 ? 0 : 1
      const text = scaled.toFixed(digits).replace(/\.0$/, '')
      return `$${text}${unit.suffix}`
    }
  }
  return `$${Math.round(volume)}`
}

export function formatPricePercent(price: number): string {
  const rounded = Math.round(price * 1000) / 10
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return `${text}%`
}

function eventSlug(value: unknown): string | null {
  const slug = asString(value)?.toLowerCase()
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null
  return slug
}

function isClosed(record: Record<string, unknown>): boolean {
  return record.closed === true || record.archived === true
}

function overlapScore(query: string, text: string): number {
  const wanted = new Set(significantTokens(query))
  if (!wanted.size) return 0
  let score = 0
  const seen = new Set<string>()
  for (const token of significantTokens(text)) {
    if (!wanted.has(token) || seen.has(token)) continue
    seen.add(token)
    score += 1
  }
  return score
}

function readOutcomes(market: Record<string, unknown>): PolymarketOutcome[] {
  const labels = parseJsonArray(market.outcomes).map((item) => asString(item)).filter((item): item is string => Boolean(item))
  const prices = parseJsonArray(market.outcomePrices)
  const pairs: PolymarketOutcome[] = []
  const count = Math.min(labels.length, prices.length, 4)
  for (let index = 0; index < count; index += 1) {
    const price = asNumber(prices[index])
    const label = labels[index]
    if (!label || price === null || price < 0 || price > 1) continue
    pairs.push({ label, price, percentLabel: formatPricePercent(price) })
  }
  return pairs
}

function marketVolume(market: Record<string, unknown>): number | null {
  return asNumber(market.volumeNum) ?? asNumber(market.volume)
}

type RankedMarket = {
  id: string
  title: string
  overlap: number
  volume: number
  outcomes: PolymarketOutcome[]
}

function rankMarkets(query: string, markets: unknown): RankedMarket | null {
  if (!Array.isArray(markets)) return null
  let best: RankedMarket | null = null
  for (const item of markets) {
    const market = asRecord(item)
    if (!market || isClosed(market) || market.active === false) continue
    const title = asString(market.question) ?? asString(market.groupItemTitle)
    if (!title) continue
    const overlap = overlapScore(query, `${title} ${asString(market.groupItemTitle) ?? ''}`)
    const volume = marketVolume(market) ?? 0
    const ranked: RankedMarket = {
      id: asString(market.id) ?? asString(market.slug) ?? title,
      title,
      overlap,
      volume,
      outcomes: readOutcomes(market),
    }
    if (
      !best ||
      ranked.overlap > best.overlap ||
      (ranked.overlap === best.overlap && ranked.volume > best.volume)
    ) {
      best = ranked
    }
  }
  return best
}

/**
 * Gamma's keep_closed_markets flag still returns resolved events.
 * Keep an open event only when it shares two topic words with the query
 * (one word is enough when the query itself is a single topic).
 */
export function selectLiveMatches(payload: unknown, query: string): PolymarketMatch[] {
  const root = asRecord(payload)
  const events = root && Array.isArray(root.events) ? root.events : []
  const matches: PolymarketMatch[] = []
  const seen = new Set<string>()
  const querySize = new Set(significantTokens(query)).size
  const minimumOverlap = querySize <= 1 ? 1 : 2

  for (const item of events) {
    const event = asRecord(item)
    if (!event || isClosed(event) || event.active === false) continue
    const slug = eventSlug(event.slug)
    if (!slug || seen.has(slug)) continue
    const eventTitle = asString(event.title) ?? ''
    const best = rankMarkets(query, event.markets)
    if (!best) continue
    const overlap = Math.max(best.overlap, overlapScore(query, eventTitle))
    if (overlap < minimumOverlap) continue
    seen.add(slug)
    matches.push({
      id: best.id,
      title: best.title,
      eventTitle,
      url: `${EVENT_URL}/${slug}`,
      outcomes: best.outcomes,
      volumeLabel: formatVolumeUsd(best.volume),
    })
    if (matches.length >= MAX_MATCHES) break
  }

  return matches
}

async function fetchGamma(query: string, fetchImpl: typeof fetch): Promise<unknown> {
  const response = await fetchImpl(polymarketSearchUrl(query), {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) {
    throw new Error(`Polymarket search returned ${response.status}`)
  }
  return response.json() as Promise<unknown>
}

export async function searchPolymarket(
  statement: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PolymarketSearchResult> {
  const cleaned = cleanStatementQuery(statement)
  const raw = statement.replace(/\s+/g, ' ').trim().slice(0, 180)
  const firstQuery = cleaned || raw
  if (firstQuery.length < 2) return { query: firstQuery, matches: [] }

  const primary = selectLiveMatches(await fetchGamma(firstQuery, fetchImpl), firstQuery)
  if (primary.length || !raw || raw.toLowerCase() === firstQuery.toLowerCase()) {
    return { query: firstQuery, matches: primary }
  }

  const secondary = selectLiveMatches(await fetchGamma(raw, fetchImpl), raw)
  if (secondary.length) return { query: raw, matches: secondary }
  return { query: firstQuery, matches: [] }
}

/** About three things to look at: prediction markets first, then a share or index if we have one. */
export function composeLiveOptions(matches: PolymarketMatch[], equities: EquityOption[]): LiveOption[] {
  const polys = matches.slice(0, 3)
  const shares = equities.filter((row) => row.symbolId).slice(0, 3)
  const toPoly = (match: PolymarketMatch): LiveOption => ({ kind: 'polymarket', id: match.id, match })
  const toEquity = (row: EquityOption): LiveOption => ({
    kind: 'equity',
    id: row.symbolId,
    symbolId: row.symbolId,
    note: row.note,
  })

  if (!polys.length) return shares.map(toEquity)
  if (!shares.length) return polys.map(toPoly)

  const polyTake = polys.length >= 2 ? 2 : 1
  const chosen: LiveOption[] = [
    ...polys.slice(0, polyTake).map(toPoly),
    ...shares.slice(0, 3 - polyTake).map(toEquity),
  ]
  for (const match of polys.slice(polyTake)) {
    if (chosen.length >= 3) break
    chosen.push(toPoly(match))
  }
  return chosen.slice(0, 3)
}

export function readPolymarketResponse(payload: unknown): PolymarketSearchResult {
  const record = asRecord(payload)
  if (!record || typeof record.query !== 'string' || !Array.isArray(record.matches)) {
    throw new Error('Polymarket search shape was unexpected.')
  }
  const matches: PolymarketMatch[] = []
  for (const item of record.matches) {
    const match = asRecord(item)
    if (!match) continue
    const title = asString(match.title)
    const url = asString(match.url)
    const id = asString(match.id)
    if (!title || !url || !id || !url.startsWith(`${EVENT_URL}/`)) continue
    const outcomes: PolymarketOutcome[] = []
    if (Array.isArray(match.outcomes)) {
      for (const outcome of match.outcomes) {
        const row = asRecord(outcome)
        if (!row) continue
        const label = asString(row.label)
        const price = asNumber(row.price)
        const percentLabel = asString(row.percentLabel)
        if (!label || price === null || !percentLabel) continue
        outcomes.push({ label, price, percentLabel })
      }
    }
    matches.push({
      id,
      title,
      eventTitle: asString(match.eventTitle) ?? '',
      url,
      outcomes,
      volumeLabel: asString(match.volumeLabel),
    })
  }
  return { query: record.query, matches }
}
