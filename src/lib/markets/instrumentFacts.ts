import type { AssetClass, InstrumentCategory } from './types'

const SHARED: InstrumentCategory[] = [
  {
    id: 'short-etf',
    title: 'Short selling an index or ETF',
    definition:
      'Borrowing a listed fund (or dealing a short via a broker) so the line benefits if the fund’s price falls. Availability, stock-borrow, and rules differ by country and account type.',
  },
  {
    id: 'inverse-etf',
    title: 'Inverse index ETFs',
    definition:
      'Listed funds designed to move in the opposite direction of an index, often for a single day at a time. Reset and compounding mean they are a different instrument from a simple short held over weeks.',
  },
  {
    id: 'puts',
    title: 'Put options on an index or ETF',
    definition:
      'Contracts that increase in value if the underlying price falls below a strike by an expiry date. They can expire worthless. This page does not price or select any contract.',
  },
  {
    id: 'cfd',
    title: 'Spread bets and CFDs',
    definition:
      'Where local rules allow, contracts for difference and spread bets track a price without owning the share or fund. Leverage cuts both ways. These products are not available in every jurisdiction.',
  },
  {
    id: 'underweight',
    title: 'Reducing or underweighting a holding',
    definition:
      'Owning less of a region, sector, or fund than a benchmark — or simply holding more cash. That is a portfolio description, not a trade ticket.',
  },
]

const EXTRA: Partial<Record<AssetClass, InstrumentCategory[]>> = {
  commodity: [
    {
      id: 'futures',
      title: 'Exchange-traded futures',
      definition:
        'Standardised contracts on metals or energy. They have expiry dates and roll costs. This paper book marks an ETF proxy, not the future itself.',
    },
  ],
  crypto: [
    {
      id: 'spot-product',
      title: 'Spot exchange-traded products',
      definition:
        'Listed products that hold the digital asset (or a claim on it). They trade like a share; they are not a wallet, and they are not available on every venue.',
    },
  ],
}

export function instrumentCategories(assetClass?: AssetClass): InstrumentCategory[] {
  if (!assetClass) return SHARED
  return [...SHARED, ...(EXTRA[assetClass] ?? [])]
}

export function instrumentFactsCopy(): string[] {
  return instrumentCategories().flatMap((item) => [item.title, item.definition])
}
