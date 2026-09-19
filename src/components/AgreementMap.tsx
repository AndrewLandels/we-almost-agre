import type { ClaimAnalysis } from '../types'

type Props = {
  analysis: ClaimAnalysis
}

export function AgreementMap({ analysis }: Props) {
  const overlap = analysis.overlapScore
  const gap = 100 - overlap

  return (
    <section className="panel" aria-labelledby="map-title">
      <p className="eyebrow">Agreement map</p>
      <h2 id="map-title">Overlap versus the leftover gap</h2>
      <p className="muted">{analysis.overlapNote}</p>
      <div className="venn-wrap">
        <svg className="venn" viewBox="0 0 420 250" role="img" aria-label="Two overlapping circles showing shared ground and contested claims">
          <circle cx="168" cy="128" r="98" fill="#3F6F5B" fillOpacity="0.42" stroke="#2C5344" strokeWidth="2.5" />
          <circle cx="252" cy="128" r="98" fill="#C47A3A" fillOpacity="0.4" stroke="#9A5724" strokeWidth="2.5" />
          <text x="118" y="124" textAnchor="middle" fill="#2C5344" fontSize="15" fontFamily="Outfit, sans-serif" fontWeight="600">
            Shared
          </text>
          <text x="118" y="146" textAnchor="middle" fill="#2C5344" fontSize="12" fontFamily="Outfit, sans-serif">
            {analysis.sharedPremises.length} premises
          </text>
          <text x="210" y="118" textAnchor="middle" fill="#1F2A24" fontSize="22" fontFamily="Fraunces, serif" fontWeight="700">
            {overlap}%
          </text>
          <text x="210" y="140" textAnchor="middle" fill="#3C4740" fontSize="11" fontFamily="Outfit, sans-serif">
            already close
          </text>
          <text x="302" y="124" textAnchor="middle" fill="#9A5724" fontSize="15" fontFamily="Outfit, sans-serif" fontWeight="600">
            Contested
          </text>
          <text x="302" y="146" textAnchor="middle" fill="#9A5724" fontSize="12" fontFamily="Outfit, sans-serif">
            {analysis.contestedClaims.length} claims
          </text>
        </svg>
      </div>
      <div className="legend">
        <span>
          <i className="swatch" style={{ background: '#3F6F5B' }} />
          Shared ground · {overlap}%
        </span>
        <span>
          <i className="swatch" style={{ background: '#C47A3A' }} />
          Still in dispute · {gap}%
        </span>
      </div>
    </section>
  )
}
