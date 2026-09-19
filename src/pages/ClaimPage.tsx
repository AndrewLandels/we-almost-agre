import { Link, useNavigate, useParams } from 'react-router-dom'
import { AgreementMap } from '../components/AgreementMap'
import { StakePanel } from '../components/StakePanel'
import { SEED_BY_ID } from '../data/seeds'
import { mapExpression } from '../lib/markets/mapExpression'
import { loadCustomClaims, saveExpression } from '../lib/storage'
import type { ClaimAnalysis, EvidenceStance } from '../types'

const STANCE_LABEL: Record<EvidenceStance, string> = {
  supports: 'Typical support',
  challenges: 'Typical challenge',
  context: 'Context',
}

function findAnalysis(id: string | undefined): ClaimAnalysis | null {
  if (!id) return null
  return SEED_BY_ID[id] ?? loadCustomClaims()[id] ?? null
}

export function ClaimPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const analysis = findAnalysis(id)

  function paperExpress() {
    if (!analysis) return
    const mapping = mapExpression(analysis.original)
    saveExpression(mapping)
    navigate(`/express/${mapping.id}`)
  }

  if (!analysis) {
    return (
      <div className="wrap error-page">
        <h1>We could not find that map</h1>
        <p className="lede">Custom maps live in this browser. Seeds are always here.</p>
        <p>
          <Link className="btn" to="/">
            Back to claims
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="wrap stack">
      <article className="quote-banner card">
        {analysis.source === 'seed' ? (
          <span className="pill">Curated seed · {analysis.topicLabel}</span>
        ) : (
          <span className="pill demo">First-pass demo analysis · {analysis.topicLabel}</span>
        )}
        <p className="eyebrow" style={{ marginTop: 12 }}>
          Original statement
        </p>
        <h1>“{analysis.original}”</h1>
        <p className="post-cta">
          <button className="btn sage" type="button" onClick={paperExpress}>
            Paper-express this statement
          </button>
          <span className="hint" style={{ marginLeft: 10 }}>
            The primary loop lives on the home page. This map is the deeper split.
          </span>
        </p>
      </article>

      {analysis.source === 'demo' ? (
        <p className="alert notice">
          This split is a heuristic stand-in, clearly labelled so a later LLM can fill the same
          shape. It is not a model verdict and not a source-checked brief.
        </p>
      ) : null}

      <AgreementMap analysis={analysis} />

      <div className="split">
        <section className="panel" aria-labelledby="shared-title">
          <p className="eyebrow">Common ground</p>
          <h2 id="shared-title">Shared premises</h2>
          <p className="muted">
            These are offered as things a reasonable person can already accept. No stakes here — on
            purpose.
          </p>
          {analysis.sharedPremises.map((premise, index) => (
            <article key={premise.id} className="premise">
              <span className="pill">Premise {index + 1}</span>
              <p>{premise.text}</p>
            </article>
          ))}
        </section>

        <section className="panel" aria-labelledby="gap-title">
          <p className="eyebrow">The leftover</p>
          <h2 id="gap-title">Contested claims</h2>
          <p className="muted">
            Evidence blurbs sit only on these nodes. Play-money is for or against the sentence, not
            the person.
          </p>
          {analysis.contestedClaims.map((claim, index) => (
            <article key={claim.id} className="contested">
              <span className="pill amber">Contested {index + 1}</span>
              <p className="quote" style={{ fontSize: '1.2rem' }}>
                {claim.text}
              </p>
              <div className="evidence">
                {claim.evidence.map((note) => (
                  <article key={note.blurb} className={`evidence ${note.stance}`}>
                    <h3>
                      {STANCE_LABEL[note.stance]}
                      {note.sourceLabel ? ` · ${note.sourceLabel}` : ''}
                    </h3>
                    <p>{note.blurb}</p>
                  </article>
                ))}
              </div>
              <StakePanel analysis={analysis} claim={claim} />
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
