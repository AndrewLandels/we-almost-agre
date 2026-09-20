import { useMemo, useState } from 'react'
import { ASSET_CLASS_LABEL, searchUniverse } from '../data/universe'
import type { UniverseSymbol } from '../lib/markets/types'

type Props = {
  onPick: (symbol: UniverseSymbol) => void
  selectedId?: string
}

export function SymbolPicker({ onPick, selectedId }: Props) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchUniverse(query, 8), [query])

  return (
    <div className="symbol-picker">
      <label className="field" htmlFor="symbol-search">
        Look up another symbol in the starter universe
      </label>
      <input
        id="symbol-search"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search SPY, gold, Tesla, copper…"
        autoComplete="off"
      />
      <ul className="symbol-results">
        {results.map((symbol) => (
          <li key={symbol.id}>
            <button
              type="button"
              className={`symbol-result ${selectedId === symbol.id ? 'active' : ''}`}
              onClick={() => onPick(symbol)}
            >
              <span className="symbol-result-id">{symbol.displaySymbol}</span>
              <span>
                <strong>{symbol.name}</strong>
                <em>{ASSET_CLASS_LABEL[symbol.assetClass]}</em>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
