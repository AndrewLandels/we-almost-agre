import { instrumentCategories } from '../lib/markets/instrumentFacts'
import type { AssetClass } from '../lib/markets/types'

export function FactualPanel({ assetClass }: { assetClass?: AssetClass }) {
  const items = instrumentCategories(assetClass)

  return (
    <section className="panel" aria-labelledby="facts-title">
      <p className="eyebrow">Facts and mechanics</p>
      <h2 id="facts-title">Instrument types that exist for this kind of exposure</h2>
      <p className="muted">
        Educational categories only. This is not a menu of things to open, and nothing here is
        ranked as a “best” way to express a view.
      </p>
      <div className="fact-list">
        {items.map((item) => (
          <article key={item.id} className="fact">
            <h3>{item.title}</h3>
            <p>{item.definition}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
