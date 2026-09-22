import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FactualPanel } from '../components/FactualPanel'
import { PaperTradePanel } from '../components/PaperTradePanel'
import { PolymarketMatches } from '../components/PolymarketMatches'
import { SymbolPicker } from '../components/SymbolPicker'
import { ASSET_CLASS_LABEL, getSymbol } from '../data/universe'
import { usePaperBook } from '../hooks/usePaperBook'
import { FCA_SOFT_LINE, FIRST_PASS_LABEL, SUGGESTION_PREFACE } from '../lib/markets/copy'
import { cannedMapping } from '../lib/markets/mapExpression'
import { usePageTitle } from '../lib/usePageTitle'
import { loadExpressions } from '../lib/storage'

export function ExpressPage() {
  const { id } = useParams()
  const mapping = useMemo(() => {
    if (!id) return null
    return loadExpressions()[id] ?? cannedMapping(id)
  }, [id])
  const { watchSymbols } = usePaperBook()
  const firstSuggestion = mapping?.suggestions[0]?.symbolId
  const [chosen, setChosen] = useState<string | undefined>(firstSuggestion)

  useEffect(() => {
    setChosen(mapping?.suggestions[0]?.symbolId)
  }, [mapping])

  useEffect(() => {
    if (!mapping) return
    const ids = [
      ...mapping.suggestions.map((row) => row.symbolId),
      ...(chosen ? [chosen] : []),
    ]
    watchSymbols(ids)
  }, [chosen, mapping, watchSymbols])

  usePageTitle(mapping ? `Express · ${mapping.topicLabel}` : 'Express · We Almost Agree')

  if (!mapping) {
    return (
      <div className="wrap error-page">
        <h1>We could not find that expression</h1>
        <p className="lede">
          Custom statements live in this browser. The flagship US-economy example is always here.
        </p>
        <p>
          <Link className="btn" to="/">
            Paste a statement
          </Link>
        </p>
      </div>
    )
  }

  const chosenSymbol = chosen ? getSymbol(chosen) : undefined

  return (
    <div className="wrap stack">
      <article className="quote-banner card">
        <span className={`pill ${mapping.source === 'curated' ? '' : 'demo'}`}>
          {mapping.source === 'curated' ? `Curated first-pass · ${mapping.topicLabel}` : FIRST_PASS_LABEL}
        </span>
        <p className="eyebrow" style={{ marginTop: 12 }}>
          Original statement
        </p>
        <h1>“{mapping.original}”</h1>
      </article>

      {mapping.source === 'heuristic' ? (
        <p className="alert notice">
          This mapping is a first-pass heuristic, clearly labelled so a later model can fill the same
          shape. It is not a research note and not a recommendation.
        </p>
      ) : (
        <p className="alert notice">
          Flagship path, still a first-pass. Suggested symbols are common ways people express views
          like this — never a suggestion that you should deal.
        </p>
      )}

      <div className="split">
        <section className="panel" aria-labelledby="shared-thin">
          <p className="eyebrow">Shared</p>
          <h2 id="shared-thin">What a reasonable person can already accept</h2>
          <p>{mapping.sharedPremise}</p>
        </section>
        <section className="panel" aria-labelledby="contested-thin">
          <p className="eyebrow">Contested expression</p>
          <h2 id="contested-thin">The leftover bet, in market language</h2>
          <p>{mapping.contestedExpression}</p>
        </section>
      </div>

      <section className="panel">
        <p className="eyebrow">What that means, mechanically</p>
        <h2>A proxy, not the whole argument</h2>
        <p>{mapping.framing}</p>
      </section>

      <section aria-labelledby="suggest-title">
        <div className="section-head" style={{ marginTop: 8 }}>
          <div>
            <p className="eyebrow">Market expressions</p>
            <h2 id="suggest-title">{SUGGESTION_PREFACE}</h2>
          </div>
          <p className="muted">Never “deal this”. Pick a line to paper-track, or look up another symbol.</p>
        </div>
        {mapping.suggestions.length ? (
          <div className="suggest-grid">
            {mapping.suggestions.map((row) => {
              const symbol = getSymbol(row.symbolId)
              if (!symbol) return null
              return (
                <button
                  key={row.symbolId}
                  type="button"
                  className={`seed-card suggest-card ${chosen === row.symbolId ? 'chosen' : ''}`}
                  onClick={() => setChosen(row.symbolId)}
                >
                  <span className="pill">{ASSET_CLASS_LABEL[symbol.assetClass]}</span>
                  <blockquote>
                    {symbol.displaySymbol}
                    <span className="paper-name"> · {symbol.name}</span>
                  </blockquote>
                  <p>{row.note}</p>
                  <p className="hint">{symbol.vehicleNote}</p>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="alert notice">
            There is no honest default ticker for this sentence. You can still pick a symbol from the
            starter universe if you want to experiment.
          </p>
        )}
        <div className="panel" style={{ marginTop: 16 }}>
          <SymbolPicker selectedId={chosen} onPick={(symbol) => setChosen(symbol.id)} />
        </div>
      </section>

      <PolymarketMatches statement={mapping.original} />

      {chosen ? <PaperTradePanel symbolId={chosen} statementId={mapping.id} /> : null}

      <FactualPanel assetClass={chosenSymbol?.assetClass} />

      <p className="alert notice">{FCA_SOFT_LINE}</p>

      <section className="panel">
        <p className="eyebrow">Go deeper</p>
        <h2>The calmer map is still here</h2>
        <p className="muted">
          Agreement maps, the blog, and play-point stakes on contested claims sit one step behind
          this paper expression. They are optional.
        </p>
        <div className="presets" style={{ marginTop: 12 }}>
          {mapping.relatedClaimId ? (
            <Link className="btn sage" to={`/claim/${mapping.relatedClaimId}`}>
              {mapping.relatedClaimLabel ?? 'Open the agreement map'}
            </Link>
          ) : null}
          {mapping.relatedBlogSlug ? (
            <Link className="btn secondary" to={`/blog/${mapping.relatedBlogSlug}`}>
              Related blog note
            </Link>
          ) : null}
          <Link className="btn secondary" to="/deeper">
            Maps, blog, and leaderboard
          </Link>
          <Link className="btn secondary" to="/book">
            Open paper book
          </Link>
        </div>
      </section>
    </div>
  )
}
