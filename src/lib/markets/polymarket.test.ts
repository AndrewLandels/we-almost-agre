import { describe, expect, it } from 'vitest'
import {
  CADENCE_LEAD,
  CADENCE_SOON,
  CLOSEST_EMPTY,
  CLOSEST_ERROR,
  CLOSEST_LENS,
  CLOSEST_TITLE,
  LONG_SHORT_NOTE,
  LONG_YES,
  PAPER_TRACK_FRAMING,
  PING_HINT,
  PING_LABEL,
  PING_SAVED,
  POLYMARKET_RISK,
  SHORT_NO,
} from './copy'
import { bannedLanguageHits } from './language'
import {
  cleanStatementQuery,
  composeLiveOptions,
  formatPricePercent,
  formatVolumeUsd,
  polymarketSearchUrl,
  polymarketTrendingUrl,
  searchPolymarket,
  selectLiveMatches,
  selectTrendingMarkets,
  suggestCadence,
  type PolymarketMatch,
} from './polymarket'

const fedPayload = {
  events: [
    {
      title: 'Fed rate cut by...?',
      slug: 'fed-rate-cut-by-629',
      closed: false,
      active: true,
      markets: [
        {
          id: 'oct',
          question: 'Fed rate cut by October 2026 meeting?',
          groupItemTitle: 'October 2026 Meeting',
          outcomes: '["Yes", "No"]',
          outcomePrices: '["0.0085", "0.9915"]',
          volumeNum: 174610,
          closed: false,
          active: true,
        },
        {
          id: 'dec',
          question: 'Fed rate cut by December 2026 meeting?',
          outcomes: '["Yes", "No"]',
          outcomePrices: '["0.0315", "0.9685"]',
          volumeNum: 372308,
          closed: false,
          active: true,
        },
        {
          id: 'resolved',
          question: 'Fed rate cut by January 2024 meeting?',
          outcomes: '["Yes", "No"]',
          outcomePrices: '["1", "0"]',
          volumeNum: 9_999_999,
          closed: true,
          active: true,
        },
      ],
    },
    {
      title: 'Fed rate cut by...?',
      slug: 'fed-rate-cut-by',
      closed: true,
      active: true,
      markets: [
        {
          id: 'old',
          question: 'Fed rate cut by December 2024 meeting?',
          outcomes: '["Yes", "No"]',
          outcomePrices: '["0.4", "0.6"]',
          volumeNum: 10,
          closed: false,
          active: true,
        },
      ],
    },
    {
      title: 'China-EU trade deal before June?',
      slug: 'china-eu-trade-deal-before-june',
      closed: false,
      active: true,
      markets: [
        {
          id: 'trade',
          question: 'China-EU trade deal before June?',
          outcomes: ['Yes', 'No'],
          outcomePrices: ['0.22', '0.78'],
          volumeNum: 50_000,
          closed: false,
          active: true,
        },
      ],
    },
  ],
}

describe('statement query cleanup', () => {
  it('keeps the topic words from a blunt sentence', () => {
    expect(cleanStatementQuery('Bitcoin will hit 150k this year')).toBe('Bitcoin hit 150k year')
    expect(cleanStatementQuery('Fed cuts rates in December')).toBe('Fed cuts rates December')
    expect(cleanStatementQuery('You should invest in Bitcoin.')).toBe('Bitcoin')
    expect(cleanStatementQuery('Electric cars are shit.')).toBe('Electric cars')
    expect(cleanStatementQuery('The US economy is going down the toilet.')).toBe('US economy down')
  })

  it('joins initials and keeps an empty sentence empty', () => {
    expect(cleanStatementQuery('The U.S. economy is in trouble.')).toBe('US economy trouble')
    expect(cleanStatementQuery('   ')).toBe('')
  })
})

describe('live Polymarket selection', () => {
  it('builds the public search URL without an affiliate code', () => {
    const url = new URL(polymarketSearchUrl('Fed cuts'))
    expect(url.origin + url.pathname).toBe('https://gamma-api.polymarket.com/public-search')
    expect(url.searchParams.get('q')).toBe('Fed cuts')
    expect(url.searchParams.get('limit_per_type')).toBe('5')
    expect(url.searchParams.get('search_profiles')).toBe('false')
    expect(url.searchParams.get('keep_closed_markets')).toBe('0')
    expect(url.search).not.toMatch(/via=/)
  })

  it('asks Gamma for last-day volume, not lifetime volume', () => {
    const url = new URL(polymarketTrendingUrl())
    expect(url.origin + url.pathname).toBe('https://gamma-api.polymarket.com/events')
    expect(url.searchParams.get('order')).toBe('volume24hr')
    expect(url.searchParams.get('ascending')).toBe('false')
    expect(url.searchParams.get('closed')).toBe('false')
    expect(url.searchParams.get('active')).toBe('true')
    expect(url.search).not.toMatch(/via=/)
  })

  it('keeps the closest open market and drops closed or unrelated rows', () => {
    const matches = selectLiveMatches(fedPayload, 'Fed cuts rates December')
    expect(matches).toHaveLength(1)
    expect(matches[0]).toMatchObject({
      id: 'dec',
      title: 'Fed rate cut by December 2026 meeting?',
      url: 'https://polymarket.com/event/fed-rate-cut-by-629',
      volumeLabel: '$372k',
    })
    expect(matches[0]?.outcomes).toEqual([
      { label: 'Yes', price: 0.0315, percentLabel: '3.2%' },
      { label: 'No', price: 0.9685, percentLabel: '96.9%' },
    ])
    expect(matches[0]?.origin).toBe('closest')
  })

  it('hides a one-word overlap when the sentence has a fuller topic', () => {
    expect(
      selectLiveMatches(
        {
          events: [
            {
              title: 'Another US debt downgrade before 2027?',
              slug: 'another-us-debt-downgrade-before-2027',
              closed: false,
              active: true,
              markets: [
                {
                  id: 'debt',
                  question: 'Another US debt downgrade before 2027?',
                  outcomes: '["Yes","No"]',
                  outcomePrices: '["0.08","0.92"]',
                  volumeNum: 13700,
                  closed: false,
                  active: true,
                },
              ],
            },
          ],
        },
        'US economy down',
      ),
    ).toEqual([])
  })

  it('keeps a match when the sentence is a single topic', () => {
    const matches = selectLiveMatches(
      {
        events: [
          {
            title: 'When will Bitcoin hit $150k?',
            slug: 'when-will-bitcoin-hit-150k',
            closed: false,
            active: true,
            markets: [
              {
                id: 'btc',
                question: 'Will Bitcoin hit $150k by December 31, 2026?',
                outcomes: '["Yes","No"]',
                outcomePrices: '["0.025","0.975"]',
                volumeNum: 100,
                closed: false,
                active: true,
              },
            ],
          },
        ],
      },
      'Bitcoin',
    )
    expect(matches).toHaveLength(1)
  })

  it('returns nothing when every hit is closed', () => {
    expect(
      selectLiveMatches(
        {
          events: [
            {
              title: 'US inflation next month?',
              slug: 'us-inflation',
              closed: true,
              markets: [
                {
                  question: 'US inflation above 3%?',
                  outcomes: '["Yes","No"]',
                  outcomePrices: '["0.5","0.5"]',
                  closed: true,
                },
              ],
            },
          ],
        },
        'US economy',
      ),
    ).toEqual([])
  })

  it('caps the list at three open events', () => {
    const events = ['Japan', 'UK', 'US', 'Eurozone'].map((name, index) => ({
      title: `${name} recession in 2026?`,
      slug: `${name.toLowerCase()}-recession-2026`,
      closed: false,
      active: true,
      markets: [
        {
          id: String(index),
          question: `${name} recession in 2026?`,
          outcomes: '["Yes","No"]',
          outcomePrices: '["0.4","0.6"]',
          volumeNum: 1000 * (index + 1),
          closed: false,
          active: true,
        },
      ],
    }))
    const matches = selectLiveMatches({ events }, 'recession 2026')
    expect(matches.map((match) => match.title)).toEqual([
      'Japan recession in 2026?',
      'UK recession in 2026?',
      'US recession in 2026?',
    ])
  })
})

describe('price and volume labels', () => {
  it('formats odds and volume in plain figures', () => {
    expect(formatPricePercent(0.025)).toBe('2.5%')
    expect(formatPricePercent(0.5)).toBe('50%')
    expect(formatVolumeUsd(2_856_493)).toBe('$2.9m')
    expect(formatVolumeUsd(0)).toBeNull()
  })
})

describe('trending Polymarket markets', () => {
  const trending = [
    {
      title: 'Rays vs Yankees',
      slug: 'rays-vs-yankees',
      closed: false,
      active: true,
      endDate: '2026-09-29T00:00:00Z',
      markets: [
        {
          id: 'quiet',
          question: 'Quiet side market',
          outcomes: '["Yes","No"]',
          outcomePrices: '["0.4","0.6"]',
          volume24hr: 100,
          volumeNum: 9_000_000,
          closed: false,
          active: true,
          endDate: '2026-09-29T00:00:00Z',
        },
        {
          id: 'busy',
          question: 'Rays vs Yankees',
          outcomes: '["Rays","Yankees"]',
          outcomePrices: '["0.46","0.54"]',
          volume24hr: 250_000,
          volumeNum: 1_000,
          closed: false,
          active: true,
          endDate: '2026-09-29T00:00:00Z',
        },
        {
          id: 'done',
          question: 'Already finished',
          outcomes: '["Yes","No"]',
          outcomePrices: '["1","0"]',
          volume24hr: 9_000_000,
          closed: true,
          active: true,
        },
      ],
    },
    {
      title: 'Closed event',
      slug: 'closed-event',
      closed: true,
      active: true,
      markets: [
        {
          id: 'old',
          question: 'Old question',
          outcomes: '["Yes","No"]',
          outcomePrices: '["0.5","0.5"]',
          volume24hr: 9_000_000,
          closed: false,
          active: true,
        },
      ],
    },
  ]

  it('picks the busiest open market and keeps a resolve date', () => {
    const matches = selectTrendingMarkets(trending)
    expect(matches).toHaveLength(1)
    expect(matches[0]).toMatchObject({
      id: 'trend-busy',
      title: 'Rays vs Yankees',
      url: 'https://polymarket.com/event/rays-vs-yankees',
      origin: 'trending',
      volumeLabel: '$250k',
      volumeWindow: '24h',
      endDate: '2026-09-29T00:00:00.000Z',
    })
  })

  it('reads a raw event array and drops a bad slug', () => {
    const matches = selectTrendingMarkets([
      ...trending,
      {
        title: 'Bad slug',
        slug: 'Not A Slug',
        closed: false,
        active: true,
        markets: [
          {
            id: 'bad',
            question: 'Bad slug market',
            outcomes: '["Yes","No"]',
            outcomePrices: '["0.2","0.8"]',
            volume24hr: 10_000_000,
            closed: false,
            active: true,
          },
        ],
      },
    ])
    expect(matches.map((match) => match.id)).toEqual(['trend-busy'])
  })
})

describe('check-in cadence', () => {
  const now = Date.parse('2026-09-22T12:00:00Z')

  it('uses daily only when resolution is inside a fortnight', () => {
    expect(suggestCadence('2026-09-29T00:00:00Z', now)).toBe('daily')
    expect(suggestCadence('2026-10-06T12:00:00Z', now)).toBe('daily')
    expect(suggestCadence('2026-10-20T00:00:00Z', now)).toBe('weekly')
    expect(suggestCadence('2026-09-01T00:00:00Z', now)).toBe('weekly')
    expect(suggestCadence(null, now)).toBe('weekly')
    expect(suggestCadence('not-a-date', now)).toBe('weekly')
  })
})

describe('searchPolymarket', () => {
  it('retries with the raw sentence when the cleaned query has no live match', async () => {
    const calls: string[] = []
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input)
      calls.push(url)
      const q = new URL(url).searchParams.get('q') ?? ''
      const body = q.includes('will')
        ? {
            events: [
              {
                title: 'When will Bitcoin hit $150k?',
                slug: 'when-will-bitcoin-hit-150k',
                closed: false,
                active: true,
                markets: [
                  {
                    id: 'btc',
                    question: 'Will Bitcoin hit $150k by December 31, 2026?',
                    outcomes: '["Yes","No"]',
                    outcomePrices: '["0.025","0.975"]',
                    volumeNum: 2_856_493,
                    closed: false,
                    active: true,
                  },
                ],
              },
            ],
          }
        : { events: [] }
      return new Response(JSON.stringify(body), { status: 200 })
    }) as typeof fetch

    const result = await searchPolymarket('Bitcoin will hit 150k this year', fetchImpl)
    const searches = calls.filter((url) => url.includes('/public-search'))
    expect(searches).toHaveLength(2)
    expect(calls.some((url) => url.includes('/events?'))).toBe(true)
    expect(result.matches[0]?.url).toBe('https://polymarket.com/event/when-will-bitcoin-hit-150k')
    expect(result.matches[0]?.volumeLabel).toBe('$2.9m')
    expect(result.trends).toEqual([])
  })

  it('searches the sentence once and also loads trends', async () => {
    let calls = 0
    const fetchImpl = (async () => {
      calls += 1
      return new Response(JSON.stringify({ events: [] }), { status: 200 })
    }) as typeof fetch
    const result = await searchPolymarket('Bitcoin 150k', fetchImpl)
    expect(calls).toBe(2)
    expect(result).toEqual({ query: 'Bitcoin 150k', matches: [], trends: [] })
  })

  it('keeps trending markets when statement search fails', async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/public-search')) return new Response('nope', { status: 503 })
      return new Response(
        JSON.stringify([
          {
            title: 'Fed Decision in October',
            slug: 'fed-decision-in-october',
            closed: false,
            active: true,
            markets: [
              {
                id: 'fed-oct',
                question: 'Fed decision in October?',
                outcomes: '["Yes","No"]',
                outcomePrices: '["0.2","0.8"]',
                volume24hr: 80_000,
                closed: false,
                active: true,
              },
            ],
          },
        ]),
        { status: 200 },
      )
    }) as typeof fetch

    const result = await searchPolymarket('Bitcoin 150k', fetchImpl)
    expect(result.matches).toEqual([])
    expect(result.trends[0]?.url).toBe('https://polymarket.com/event/fed-decision-in-october')
  })

  it('throws when both search and trends fail', async () => {
    const fetchImpl = (async () => new Response('nope', { status: 503 })) as typeof fetch
    await expect(searchPolymarket('Bitcoin 150k', fetchImpl)).rejects.toThrow(/503/)
  })
})

function sampleMatch(id: string, origin: PolymarketMatch['origin'] = 'closest'): PolymarketMatch {
  return {
    id,
    title: id,
    eventTitle: id,
    url: `https://polymarket.com/event/${id}`,
    outcomes: [],
    volumeLabel: null,
    volumeWindow: null,
    origin,
    endDate: null,
  }
}

describe('compose live options', () => {
  const shares = [
    { symbolId: 'SPY', note: 'Broad US equities' },
    { symbolId: 'QQQ', note: 'Nasdaq-100' },
    { symbolId: 'IWM', note: 'Smaller US companies' },
  ]

  it('lists closest markets, then shares, then trends that are not already shown', () => {
    const options = composeLiveOptions(
      [sampleMatch('fed'), sampleMatch('cpi'), sampleMatch('jobs')],
      shares,
      [sampleMatch('fed', 'trending'), sampleMatch('rays', 'trending'), sampleMatch('yankees', 'trending')],
    )
    expect(options.map((option) => option.id)).toEqual(['fed', 'cpi', 'jobs', 'SPY', 'QQQ', 'IWM', 'rays', 'yankees'])
  })

  it('fills with shares and trends when only one prediction market is close', () => {
    const options = composeLiveOptions([sampleMatch('btc')], shares, [sampleMatch('rays', 'trending')])
    expect(options.map((option) => option.kind)).toEqual(['polymarket', 'equity', 'equity', 'equity', 'polymarket'])
    expect(options.map((option) => option.id)).toEqual(['btc', 'SPY', 'QQQ', 'IWM', 'rays'])
  })

  it('shows shares and trends when no live market is close', () => {
    expect(composeLiveOptions([], shares, [sampleMatch('rays', 'trending')]).map((option) => option.id)).toEqual([
      'SPY',
      'QQQ',
      'IWM',
      'rays',
    ])
  })

  it('shows prediction markets alone when there is no share', () => {
    expect(composeLiveOptions([sampleMatch('a'), sampleMatch('b'), sampleMatch('c')], []).map((option) => option.id)).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('stops at eight options', () => {
    const matches = ['a', 'b', 'c', 'd'].map((id) => sampleMatch(id))
    const trends = ['e', 'f', 'g', 'h', 'i'].map((id) => sampleMatch(id, 'trending'))
    const options = composeLiveOptions(matches, shares, trends)
    expect(options).toHaveLength(8)
    expect(options.map((option) => option.id)).toEqual(['a', 'b', 'c', 'SPY', 'QQQ', 'IWM', 'e', 'f'])
  })
})

describe('Polymarket copy', () => {
  it('stays on the non-advice side of the language rules', () => {
    for (const text of [
      CLOSEST_TITLE,
      CLOSEST_LENS,
      POLYMARKET_RISK,
      CLOSEST_EMPTY,
      CLOSEST_ERROR,
      PAPER_TRACK_FRAMING,
      LONG_YES,
      SHORT_NO,
      LONG_SHORT_NOTE,
      CADENCE_LEAD,
      CADENCE_SOON,
      PING_LABEL,
      PING_HINT,
      PING_SAVED,
    ]) {
      expect(bannedLanguageHits(text), text).toEqual([])
    }
  })
})
