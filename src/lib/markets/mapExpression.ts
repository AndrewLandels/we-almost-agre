import { matchSeedClaim } from '../analyzeClaim'
import { customClaimId } from '../slug'
import type { ExpressionMapping, ExpressionSuggestion } from './types'

function normalise(text: string): string {
  return text.toLowerCase().replace(/['’]/g, "'").replace(/\s+/g, ' ').trim()
}

function suggestion(symbolId: string, note: string): ExpressionSuggestion {
  return { symbolId, note }
}

type Rule = {
  id: string
  topicLabel: string
  relatedClaimId?: string
  relatedClaimLabel?: string
  relatedBlogSlug?: string
  test: (haystack: string) => boolean
  build: (original: string) => Pick<
    ExpressionMapping,
    'sharedPremise' | 'contestedExpression' | 'framing' | 'suggestions'
  >
}

const US_DOWN =
  /\b(us|u\.s\.|u s|america|american|united states)\b.{0,40}\b(econom|recession|downturn|slowdown|crash|toilet|tank|collapse|stagnat)/i
const ECONOMY_DOWN =
  /\b(econom(y|ies|ic).{0,30}(toilet|tank|crash|collapse|recession|downturn|ruin|dead|awful|terrible|shit|crap)|going down the toilet|hard landing|bear market)\b/i
const US_UP =
  /\b(us|u\.s\.|america|american|united states)\b.{0,40}\b(boom|roaring|soft landing|goldilocks|strong econom)/i
const EV =
  /\b(electric cars?|electric vehicles?|evs?\b|tesla)\b/i
const BITCOIN = /\b(bitcoin|\bbtc\b|crypto)\b/i
const GOLD = /\b(gold|bullion)\b/i
const OIL = /\b(oil|crude|opec|petrol price|gasoline)\b/i
const COPPER = /\b(copper)\b/i
const AI = /\b(\bai\b|artificial intelligence|nvidia|gpu|chipmaker)\b/i
const INFLATION = /\b(inflation|cost of living|prices? (are|keep) (up|rising|high))\b/i

const RULES: Rule[] = [
  {
    id: 'us-economy-down',
    topicLabel: 'US economy',
    test: (haystack) => US_DOWN.test(haystack) || ECONOMY_DOWN.test(haystack),
    build: () => ({
      sharedPremise:
        'Most people prefer a healthy economy and care about jobs, prices, and a measure of stability.',
      contestedExpression:
        'From here, broad US equity markets will do poorly — often treated, in markets, as the S&P 500 falling or lagging.',
      framing:
        'People who hold a strongly negative view of the US economic outlook sometimes express that view by taking positions that benefit if broad US share prices fall. The S&P 500 is a widely used gauge of large US companies. It is not the same thing as “the economy”, but it is a common proxy in markets.',
      suggestions: [
        suggestion(
          'SPY',
          'One common way people express a bearish US-economy view is by positioning against broad US equities such as the S&P 500. Paper marks here use the SPY ETF as a liquid proxy for that index.',
        ),
        suggestion(
          'QQQ',
          'Views about US growth also show up against large, technology-heavy baskets. The Nasdaq-100 — here via the QQQ ETF — is a frequent companion expression.',
        ),
        suggestion(
          'IWM',
          'Smaller US companies are another place this kind of outlook is often expressed. Paper marks use IWM as a proxy for the Russell 2000.',
        ),
        suggestion(
          'CPER',
          'Industrial metals such as copper are sometimes treated as a cyclical companion to a growth-outlook view. This line uses the CPER ETF as a liquid proxy, not a copper future.',
        ),
      ],
    }),
  },
  {
    id: 'us-economy-up',
    topicLabel: 'US economy',
    test: (haystack) => US_UP.test(haystack),
    build: () => ({
      sharedPremise:
        'Most people prefer a healthy economy and care about jobs, prices, and a measure of stability.',
      contestedExpression:
        'From here, broad US equity markets will do well — often treated as the S&P 500 rising or leading.',
      framing:
        'People who hold a constructive view of the US economic outlook sometimes express that view by taking positions that benefit if broad US share prices rise. The S&P 500 is a gauge of large companies, not a complete picture of households or jobs.',
      suggestions: [
        suggestion(
          'SPY',
          'One common way people express an optimistic US-economy view is by positioning in broad US equities such as the S&P 500 (here via the SPY ETF).',
        ),
        suggestion(
          'QQQ',
          'A growth-tilted companion expression is the Nasdaq-100, marked here through QQQ.',
        ),
        suggestion(
          'IWM',
          'Smaller US companies (Russell 2000 via IWM) are another basket this kind of outlook sometimes uses.',
        ),
      ],
    }),
  },
  {
    id: 'electric-vehicles',
    topicLabel: 'Electric vehicles',
    relatedClaimId: 'electric-cars',
    relatedClaimLabel: 'Open the electric-cars agreement map',
    relatedBlogSlug: 'electric-cars-worked-example',
    test: (haystack) => EV.test(haystack),
    build: (original) => {
      const sceptical = /\b(shit|crap|awful|terrible|sucks|dead|fail|bubble|overrated|hate)\b/i.test(
        original,
      )
      return {
        sharedPremise:
          'A car has to work in ordinary life — journeys, weather, budget — and every drivetrain has a cost and a footprint.',
        contestedExpression: sceptical
          ? 'From here, listed companies most associated with electric vehicles will do poorly relative to the rest of the market.'
          : 'From here, listed companies most associated with electric vehicles will do well relative to the rest of the market.',
        framing: sceptical
          ? 'A blunt view that electric cars “do not work” is sometimes expressed in markets by positioning against the best-known EV makers. That is a company-price expression, not a verdict on every driver or every grid.'
          : 'A constructive view of electric vehicles is sometimes expressed by positioning in the best-known listed EV makers. Share prices are not the same thing as whether the cars are any good in ordinary life.',
        suggestions: [
          suggestion(
            'TSLA',
            sceptical
              ? 'One common way people express a sceptical EV view is by positioning against listed EV makers. Tesla (TSLA) is the most watched name in that set — a company share, not “the car market”.'
              : 'One common way people express a constructive EV view is by positioning in listed EV makers. Tesla (TSLA) is the most watched name in that set — a company share, not “the car market”.',
          ),
          suggestion(
            'XOM',
            'A related (and different) expression of a transport-energy view is positioning in large oil producers. Exxon Mobil is in the starter book as an ordinary share, not a recommendation.',
          ),
        ],
      }
    },
  },
  {
    id: 'bitcoin',
    topicLabel: 'Bitcoin',
    relatedClaimId: 'bitcoin',
    relatedClaimLabel: 'Open the Bitcoin agreement map',
    relatedBlogSlug: 'bitcoin-worked-example',
    test: (haystack) => BITCOIN.test(haystack),
    build: (original) => {
      const sceptical = /\b(shit|crap|scam|bubble|dead|crash|avoid|never|don't|do not)\b/i.test(
        original,
      )
      return {
        sharedPremise:
          'People look for ways to save, speculate, or hedge when cash and familiar assets feel uncertain. A scarce digital asset can be interesting even if you never want to “be a Bitcoin person”.',
        contestedExpression: sceptical
          ? 'From here, Bitcoin’s market price will do poorly.'
          : 'From here, Bitcoin’s market price will do well.',
        framing:
          'Views about Bitcoin are often expressed through liquid spot products rather than by running a wallet. A listed product’s price can diverge from “coins on an exchange”, and none of this is a suggestion to hold either.',
        suggestions: [
          suggestion(
            'IBIT',
            sceptical
              ? 'One common way people express a sceptical Bitcoin view is by positioning against a spot Bitcoin product. Paper marks here use IBIT as a liquid proxy — not coins in a wallet.'
              : 'One common way people express a constructive Bitcoin view is by positioning in a spot Bitcoin product. Paper marks here use IBIT as a liquid proxy — not coins in a wallet.',
          ),
          suggestion(
            'GLD',
            'A neighbouring expression of a “hard asset” view is gold. Paper marks use the GLD ETF as a liquid proxy for bullion, not a gold future.',
          ),
        ],
      }
    },
  },
  {
    id: 'gold',
    topicLabel: 'Gold',
    test: (haystack) => GOLD.test(haystack),
    build: () => ({
      sharedPremise:
        'People look for stores of value when they worry about inflation, currency, or political risk. Gold has a long history in that conversation.',
      contestedExpression: 'From here, the gold price will do well — or poorly — relative to cash.',
      framing:
        'A gold view is often expressed through listed bullion products. The metal, a future, and an ETF can move together without being the same instrument.',
      suggestions: [
        suggestion(
          'GLD',
          'One common way people express a gold view is through a listed bullion product. Paper marks use GLD as a liquid ETF proxy, not a COMEX future.',
        ),
        suggestion(
          'SLV',
          'Silver is a frequent companion expression. Paper marks use the SLV ETF as a liquid proxy.',
        ),
      ],
    }),
  },
  {
    id: 'oil',
    topicLabel: 'Oil',
    test: (haystack) => OIL.test(haystack),
    build: () => ({
      sharedPremise:
        'The oil price still matters for fuel, freight, and a slice of inflation. People can share that without sharing a forecast.',
      contestedExpression: 'From here, crude oil will do well — or poorly — from today’s mark.',
      framing:
        'An oil view is often expressed through futures-linked funds rather than a physical barrel. Roll costs mean the fund is a cousin of the headline crude number, not a perfect copy.',
      suggestions: [
        suggestion(
          'USO',
          'One common way people express an oil-price view is through a futures-linked fund. Paper marks use USO as a liquid proxy for WTI-style exposure — not a barrel in a tank.',
        ),
        suggestion(
          'XOM',
          'A related equity expression is a large listed producer. Exxon Mobil is in the starter book as an ordinary share.',
        ),
      ],
    }),
  },
  {
    id: 'copper',
    topicLabel: 'Copper',
    test: (haystack) => COPPER.test(haystack),
    build: () => ({
      sharedPremise:
        'Copper is used in power, building, and many kinds of industry. People who talk about “the cycle” often mention it.',
      contestedExpression: 'From here, the copper price will do well — or poorly — from today’s mark.',
      framing:
        'A copper view is often expressed through futures-linked products. The metal, the future, and the ETF can drift apart.',
      suggestions: [
        suggestion(
          'CPER',
          'One common way people express a copper view is through a futures-linked fund. Paper marks use CPER as a liquid proxy, not the COMEX contract.',
        ),
        suggestion(
          'SPY',
          'Because copper is sometimes treated as a cyclical companion to growth, a broad equity gauge such as the S&P 500 (via SPY) is a neighbouring expression.',
        ),
      ],
    }),
  },
  {
    id: 'ai-chips',
    topicLabel: 'AI and chips',
    test: (haystack) => AI.test(haystack),
    build: () => ({
      sharedPremise:
        'Computing is using more specialised chips, and several listed companies sit in the middle of that spend.',
      contestedExpression:
        'From here, the best-known listed chip and platform names will do well — or poorly — from today’s marks.',
      framing:
        'An “AI will change everything” view is often expressed through a handful of large listed names. That is a share-price expression, not a proof of the technology story.',
      suggestions: [
        suggestion(
          'NVDA',
          'One common way people express an AI-infrastructure view is by positioning in listed chip designers. NVIDIA is the most watched name in that set.',
        ),
        suggestion(
          'MSFT',
          'A neighbouring expression is a large software platform that is spending on the same theme. Microsoft is in the starter book as an ordinary share.',
        ),
        suggestion(
          'QQQ',
          'A basket expression of the same mood is the Nasdaq-100, marked here through QQQ.',
        ),
      ],
    }),
  },
  {
    id: 'inflation',
    topicLabel: 'Inflation',
    test: (haystack) => INFLATION.test(haystack),
    build: () => ({
      sharedPremise:
        'People care about what their money still buys. Prices going up is a shared irritation even when the forecast differs.',
      contestedExpression:
        'From here, inflation stays uncomfortably high — and some listed “hard asset” prices will reflect that.',
      framing:
        'An inflation view is sometimes expressed through gold, energy, or broad equities. None of those is inflation itself; they are neighbouring market expressions.',
      suggestions: [
        suggestion(
          'GLD',
          'One common way people express an inflation-worry view is through gold. Paper marks use the GLD ETF as a liquid proxy for bullion.',
        ),
        suggestion(
          'USO',
          'Energy prices are another neighbouring expression. Paper marks use USO as a liquid oil-fund proxy.',
        ),
        suggestion(
          'SPY',
          'Broad equities sometimes reprice with the inflation story as well. The S&P 500 via SPY is in the starter book as a gauge, not a forecast.',
        ),
      ],
    }),
  },
]

const SEED_RELATED: Record<
  string,
  Pick<ExpressionMapping, 'relatedClaimId' | 'relatedClaimLabel' | 'relatedBlogSlug'>
> = {
  'electric-cars': {
    relatedClaimId: 'electric-cars',
    relatedClaimLabel: 'Open the electric-cars agreement map',
    relatedBlogSlug: 'electric-cars-worked-example',
  },
  bitcoin: {
    relatedClaimId: 'bitcoin',
    relatedClaimLabel: 'Open the Bitcoin agreement map',
    relatedBlogSlug: 'bitcoin-worked-example',
  },
  'us-speech': {
    relatedClaimId: 'us-speech',
    relatedClaimLabel: 'Open the US speech agreement map',
  },
}

export const CANNED_STATEMENTS: Record<string, string> = {
  'us-economy-down': 'The US economy is going down the toilet.',
  'electric-vehicles': 'Electric cars are shit.',
  bitcoin: 'You should invest in Bitcoin.',
  'us-speech': "America doesn't have freedom of speech.",
}

function civicFallback(original: string): ExpressionMapping {
  return {
    id: 'us-speech',
    original,
    source: 'heuristic',
    firstPass: true,
    topicLabel: 'Civic',
    sharedPremise:
      'People can care about the same civic goods — speech, fairness, a working public square — and still argue about the leftover claim.',
    contestedExpression:
      'The punchline of the sentence is still in dispute. It is not, by itself, a common market expression.',
    framing:
      'This kind of civic claim is not usually expressed as a ticker. The paper book still lets you look up a symbol if you want to experiment, but there is no honest default instrument for the sentence. The fuller agreement map is the better next step.',
    suggestions: [],
    ...SEED_RELATED['us-speech'],
  }
}

function generalFallback(original: string): ExpressionMapping {
  return {
    id: customClaimId(original),
    original,
    source: 'heuristic',
    firstPass: true,
    topicLabel: 'General',
    sharedPremise:
      'Most public fights mix a value people already share with a leftover bet about what happens next.',
    contestedExpression:
      'The leftover bet is still live. Markets sometimes treat a vague “things get worse / better” mood as a move in broad risk assets — that is a weak proxy, not a translation.',
    framing:
      'This is a first-pass guess. When a statement is about the general mood rather than a named asset, people often look at a broad equity gauge such as the S&P 500. That is a habit, not a rule, and it is not a suggestion to deal.',
    suggestions: [
      suggestion(
        'SPY',
        'When the statement is about the general weather of markets, one common (and blunt) expression is a broad US equity gauge. Paper marks use SPY as a liquid S&P 500 proxy. Treat this as a weak first-pass, not a fit.',
      ),
      suggestion(
        'GLD',
        'A neighbouring expression of caution is gold, marked here through the GLD ETF. Only relevant if the sentence was about safety or inflation — otherwise skip it.',
      ),
    ],
  }
}

/**
 * Map a gut statement to common market expressions.
 * v1 is a labelled heuristic so the product loop works without a model key.
 * The return shape is the contract a later LLM mapper should fill.
 */
export function mapExpression(text: string): ExpressionMapping {
  const trimmed = text.trim()
  if (trimmed.length < 8) {
    throw new Error('Please paste a statement of at least a few words.')
  }

  const haystack = normalise(trimmed)
  const seed = matchSeedClaim(trimmed)
  const rule = RULES.find((entry) => entry.test(haystack))

  if (seed?.id === 'us-speech' && !rule) {
    return civicFallback(trimmed)
  }

  if (rule) {
    const built = rule.build(trimmed)
    const related =
      (seed && SEED_RELATED[seed.id]) ||
      (rule.relatedClaimId
        ? {
            relatedClaimId: rule.relatedClaimId,
            relatedClaimLabel: rule.relatedClaimLabel,
            relatedBlogSlug: rule.relatedBlogSlug,
          }
        : {})

    return {
      id: rule.id,
      original: trimmed,
      source: rule.id === 'us-economy-down' || rule.id === 'electric-vehicles' || rule.id === 'bitcoin'
        ? 'curated'
        : 'heuristic',
      firstPass: true,
      topicLabel: rule.topicLabel,
      ...built,
      ...related,
    }
  }

  if (seed) {
    const related = SEED_RELATED[seed.id]
    return {
      ...generalFallback(trimmed),
      id: `expr-${seed.id}`,
      ...related,
    }
  }

  return generalFallback(trimmed)
}

export function isMappable(text: string): boolean {
  return text.trim().length >= 8
}

export function cannedMapping(id: string): ExpressionMapping | null {
  const statement = CANNED_STATEMENTS[id]
  if (!statement) return null
  const mapped = mapExpression(statement)
  return { ...mapped, id }
}

export function mappingCopyBundle(mapping: ExpressionMapping): string[] {
  return [
    mapping.sharedPremise,
    mapping.contestedExpression,
    mapping.framing,
    ...mapping.suggestions.map((row) => row.note),
  ]
}
