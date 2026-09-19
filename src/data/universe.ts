import type { AssetClass, UniverseSymbol } from '../lib/markets/types'

export const UNIVERSE: UniverseSymbol[] = [
  {
    id: 'SPY',
    yahooSymbol: 'SPY',
    displaySymbol: 'SPY',
    name: 'S&P 500 (SPDR ETF)',
    assetClass: 'index',
    quoteVehicle: 'etf-proxy',
    vehicleNote:
      'Paper marks use SPY, a liquid US-listed ETF, as a proxy for the S&P 500 cash index — not the index future itself.',
    keywords: ['s&p', 'spx', 'sp500', 'us market', 'us equities', 'wall street', 'spy'],
    region: 'US',
  },
  {
    id: 'QQQ',
    yahooSymbol: 'QQQ',
    displaySymbol: 'QQQ',
    name: 'Nasdaq-100 (Invesco ETF)',
    assetClass: 'index',
    quoteVehicle: 'etf-proxy',
    vehicleNote:
      'Paper marks use QQQ as a liquid proxy for the Nasdaq-100, which is heavier in large US technology names than the S&P 500.',
    keywords: ['nasdaq', 'ndx', 'qqq', 'tech', 'growth'],
    region: 'US',
  },
  {
    id: 'IWM',
    yahooSymbol: 'IWM',
    displaySymbol: 'IWM',
    name: 'Russell 2000 (iShares ETF)',
    assetClass: 'index',
    quoteVehicle: 'etf-proxy',
    vehicleNote:
      'Paper marks use IWM as a liquid proxy for the Russell 2000, a gauge of smaller US listed companies.',
    keywords: ['russell', 'small cap', 'iwm', 'small companies'],
    region: 'US',
  },
  {
    id: 'DIA',
    yahooSymbol: 'DIA',
    displaySymbol: 'DIA',
    name: 'Dow Jones Industrial Average (SPDR ETF)',
    assetClass: 'index',
    quoteVehicle: 'etf-proxy',
    vehicleNote:
      'Paper marks use DIA as a liquid proxy for the Dow Jones Industrial Average, a price-weighted basket of 30 large US companies.',
    keywords: ['dow', 'djia', 'dia', 'industrials'],
    region: 'US',
  },
  {
    id: 'EWU',
    yahooSymbol: 'EWU',
    displaySymbol: 'EWU',
    name: 'UK large caps (iShares MSCI United Kingdom ETF)',
    assetClass: 'index',
    quoteVehicle: 'etf-proxy',
    vehicleNote:
      'Paper marks use EWU, a US-listed ETF of large UK companies, as a liquid stand-in for a FTSE-style UK equity view — not the FTSE 100 future.',
    keywords: ['ftse', 'uk', 'britain', 'london', 'ewu'],
    region: 'UK',
  },
  {
    id: 'EWG',
    yahooSymbol: 'EWG',
    displaySymbol: 'EWG',
    name: 'Germany large caps (iShares MSCI Germany ETF)',
    assetClass: 'index',
    quoteVehicle: 'etf-proxy',
    vehicleNote:
      'Paper marks use EWG as a liquid proxy for large German listed companies — a cousin of a DAX view, not the DAX future.',
    keywords: ['dax', 'germany', 'frankfurt', 'ewg'],
    region: 'DE',
  },
  {
    id: 'EWJ',
    yahooSymbol: 'EWJ',
    displaySymbol: 'EWJ',
    name: 'Japan large caps (iShares MSCI Japan ETF)',
    assetClass: 'index',
    quoteVehicle: 'etf-proxy',
    vehicleNote:
      'Paper marks use EWJ as a liquid proxy for large Japanese listed companies — a cousin of a Nikkei view, not the Nikkei future.',
    keywords: ['nikkei', 'japan', 'tokyo', 'ewj'],
    region: 'JP',
  },
  {
    id: 'AAPL',
    yahooSymbol: 'AAPL',
    displaySymbol: 'AAPL',
    name: 'Apple',
    assetClass: 'stock',
    quoteVehicle: 'stock',
    vehicleNote: 'Ordinary US-listed common shares. Paper marks follow the public Apple share price.',
    keywords: ['apple', 'iphone', 'aapl'],
    region: 'US',
  },
  {
    id: 'MSFT',
    yahooSymbol: 'MSFT',
    displaySymbol: 'MSFT',
    name: 'Microsoft',
    assetClass: 'stock',
    quoteVehicle: 'stock',
    vehicleNote: 'Ordinary US-listed common shares. Paper marks follow the public Microsoft share price.',
    keywords: ['microsoft', 'msft', 'azure', 'windows'],
    region: 'US',
  },
  {
    id: 'GOOGL',
    yahooSymbol: 'GOOGL',
    displaySymbol: 'GOOGL',
    name: 'Alphabet',
    assetClass: 'stock',
    quoteVehicle: 'stock',
    vehicleNote: 'Class A US-listed shares. Paper marks follow the public Alphabet share price.',
    keywords: ['google', 'alphabet', 'googl', 'search'],
    region: 'US',
  },
  {
    id: 'AMZN',
    yahooSymbol: 'AMZN',
    displaySymbol: 'AMZN',
    name: 'Amazon',
    assetClass: 'stock',
    quoteVehicle: 'stock',
    vehicleNote: 'Ordinary US-listed common shares. Paper marks follow the public Amazon share price.',
    keywords: ['amazon', 'amzn', 'aws'],
    region: 'US',
  },
  {
    id: 'META',
    yahooSymbol: 'META',
    displaySymbol: 'META',
    name: 'Meta Platforms',
    assetClass: 'stock',
    quoteVehicle: 'stock',
    vehicleNote: 'Ordinary US-listed common shares. Paper marks follow the public Meta share price.',
    keywords: ['meta', 'facebook', 'instagram'],
    region: 'US',
  },
  {
    id: 'NVDA',
    yahooSymbol: 'NVDA',
    displaySymbol: 'NVDA',
    name: 'NVIDIA',
    assetClass: 'stock',
    quoteVehicle: 'stock',
    vehicleNote: 'Ordinary US-listed common shares. Paper marks follow the public NVIDIA share price.',
    keywords: ['nvidia', 'nvda', 'gpu', 'ai chips'],
    region: 'US',
  },
  {
    id: 'TSLA',
    yahooSymbol: 'TSLA',
    displaySymbol: 'TSLA',
    name: 'Tesla',
    assetClass: 'stock',
    quoteVehicle: 'stock',
    vehicleNote: 'Ordinary US-listed common shares. Paper marks follow the public Tesla share price.',
    keywords: ['tesla', 'tsla', 'ev', 'electric car'],
    region: 'US',
  },
  {
    id: 'JPM',
    yahooSymbol: 'JPM',
    displaySymbol: 'JPM',
    name: 'JPMorgan Chase',
    assetClass: 'stock',
    quoteVehicle: 'stock',
    vehicleNote: 'Ordinary US-listed common shares. Paper marks follow the public JPMorgan share price.',
    keywords: ['jpmorgan', 'jpm', 'bank', 'banks'],
    region: 'US',
  },
  {
    id: 'XOM',
    yahooSymbol: 'XOM',
    displaySymbol: 'XOM',
    name: 'Exxon Mobil',
    assetClass: 'stock',
    quoteVehicle: 'stock',
    vehicleNote: 'Ordinary US-listed common shares. Paper marks follow the public Exxon Mobil share price.',
    keywords: ['exxon', 'xom', 'oil major', 'energy stock'],
    region: 'US',
  },
  {
    id: 'JNJ',
    yahooSymbol: 'JNJ',
    displaySymbol: 'JNJ',
    name: 'Johnson & Johnson',
    assetClass: 'stock',
    quoteVehicle: 'stock',
    vehicleNote: 'Ordinary US-listed common shares. Paper marks follow the public Johnson & Johnson share price.',
    keywords: ['johnson', 'jnj', 'healthcare'],
    region: 'US',
  },
  {
    id: 'V',
    yahooSymbol: 'V',
    displaySymbol: 'V',
    name: 'Visa',
    assetClass: 'stock',
    quoteVehicle: 'stock',
    vehicleNote: 'Ordinary US-listed common shares. Paper marks follow the public Visa share price.',
    keywords: ['visa', 'payments'],
    region: 'US',
  },
  {
    id: 'UNH',
    yahooSymbol: 'UNH',
    displaySymbol: 'UNH',
    name: 'UnitedHealth',
    assetClass: 'stock',
    quoteVehicle: 'stock',
    vehicleNote: 'Ordinary US-listed common shares. Paper marks follow the public UnitedHealth share price.',
    keywords: ['unitedhealth', 'unh', 'health insurer'],
    region: 'US',
  },
  {
    id: 'GLD',
    yahooSymbol: 'GLD',
    displaySymbol: 'GLD',
    name: 'Gold (SPDR Gold Shares)',
    assetClass: 'commodity',
    quoteVehicle: 'etf-proxy',
    vehicleNote:
      'Paper marks use GLD, a liquid ETF backed by allocated gold, as a proxy for a gold view — not a COMEX gold future.',
    keywords: ['gold', 'gld', 'bullion', 'precious metal'],
  },
  {
    id: 'SLV',
    yahooSymbol: 'SLV',
    displaySymbol: 'SLV',
    name: 'Silver (iShares Silver Trust)',
    assetClass: 'commodity',
    quoteVehicle: 'etf-proxy',
    vehicleNote:
      'Paper marks use SLV, a liquid silver ETF, as a proxy for a silver view — not a silver future.',
    keywords: ['silver', 'slv'],
  },
  {
    id: 'USO',
    yahooSymbol: 'USO',
    displaySymbol: 'USO',
    name: 'WTI crude oil (United States Oil Fund)',
    assetClass: 'commodity',
    quoteVehicle: 'etf-proxy',
    vehicleNote:
      'Paper marks use USO, a liquid ETF that holds WTI crude futures, as a proxy for an oil view — not a single continuous futures contract you can roll yourself.',
    keywords: ['oil', 'wti', 'crude', 'uso', 'petroleum'],
  },
  {
    id: 'CPER',
    yahooSymbol: 'CPER',
    displaySymbol: 'CPER',
    name: 'Copper (United States Copper Index Fund)',
    assetClass: 'commodity',
    quoteVehicle: 'etf-proxy',
    vehicleNote:
      'Paper marks use CPER, a liquid ETF linked to copper futures, as a proxy for a copper view — not the COMEX copper future itself.',
    keywords: ['copper', 'cper', 'industrial metal', 'dr copper'],
  },
  {
    id: 'IBIT',
    yahooSymbol: 'IBIT',
    displaySymbol: 'IBIT',
    name: 'Spot Bitcoin (iShares Bitcoin Trust)',
    assetClass: 'crypto',
    quoteVehicle: 'etf-proxy',
    vehicleNote:
      'Paper marks use IBIT, a US-listed spot Bitcoin product, as a liquid proxy for a Bitcoin view — not a wallet of coins and not a futures contract.',
    keywords: ['bitcoin', 'btc', 'crypto', 'ibit'],
  },
]

export const UNIVERSE_BY_ID = Object.fromEntries(UNIVERSE.map((item) => [item.id, item])) as Record<
  string,
  UniverseSymbol
>

export function getSymbol(id: string): UniverseSymbol | undefined {
  return UNIVERSE_BY_ID[id.toUpperCase()]
}

export function listUniverse(assetClass?: AssetClass): UniverseSymbol[] {
  if (!assetClass) return UNIVERSE
  return UNIVERSE.filter((item) => item.assetClass === assetClass)
}

export function searchUniverse(query: string, limit = 12): UniverseSymbol[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return UNIVERSE.slice(0, limit)

  const scored = UNIVERSE.map((item) => {
    const haystacks = [
      item.id.toLowerCase(),
      item.displaySymbol.toLowerCase(),
      item.name.toLowerCase(),
      item.assetClass,
      ...item.keywords.map((word) => word.toLowerCase()),
    ]
    let score = 0
    for (const hay of haystacks) {
      if (hay === needle) score += 100
      else if (hay.startsWith(needle)) score += 40
      else if (hay.includes(needle)) score += 15
    }
    return { item, score }
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))

  return scored.slice(0, limit).map((row) => row.item)
}

export const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  index: 'Index (ETF proxy)',
  stock: 'Share',
  commodity: 'Commodity (ETF proxy)',
  crypto: 'Digital asset (ETF proxy)',
}
