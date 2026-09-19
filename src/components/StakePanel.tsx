import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { formatPoints, MIN_STAKE, settledForNode, STAKE_PRESETS, stakeForNode } from '../lib/points'
import type { ClaimAnalysis, ContestedClaim, StakeSide } from '../types'

type Props = {
  analysis: ClaimAnalysis
  claim: ContestedClaim
}

export function StakePanel({ analysis, claim }: Props) {
  const { wallet, placeStake, resolveStake } = useWallet()
  const [side, setSide] = useState<StakeSide>('for')
  const [amount, setAmount] = useState<(typeof STAKE_PRESETS)[number]>(50)
  const [error, setError] = useState<string | null>(null)

  const open = stakeForNode(wallet, claim.id)
  const settled = settledForNode(wallet, claim.id)
  const canAfford = wallet.balance >= amount

  function onStake() {
    setError(null)
    try {
      placeStake(analysis, claim.id, side, amount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place that stake.')
    }
  }

  function onSettle() {
    setError(null)
    try {
      resolveStake(analysis, claim.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not settle that stake.')
    }
  }

  if (settled) {
    return (
      <div className={`alert ${settled.won ? 'success' : ''}`}>
        {settled.won
          ? `You were closer. Demo lean: ${settled.resolvedAs}. Returned ${formatPoints(settled.payout)} points.`
          : `The demo lean went the other way (${settled.resolvedAs}). The ${formatPoints(settled.amount)}-point stake is gone.`}
      </div>
    )
  }

  if (open) {
    return (
      <div className="stake-box">
        <p>
          Open stake: <strong>{formatPoints(open.amount)}</strong> points{' '}
          <strong>{open.side}</strong> this contested claim.
        </p>
        {claim.demoResolution === 'open' ? (
          <p className="muted">
            No demo resolution yet — this one stays a live argument. Your points stay locked so the
            board can remember you took a view.
          </p>
        ) : (
          <>
            <p className="muted">{claim.demoResolutionNote}</p>
            <button className="btn sage small" type="button" onClick={onSettle}>
              Settle against the demo lean
            </button>
          </>
        )}
        {error ? <p className="alert">{error}</p> : null}
      </div>
    )
  }

  return (
    <div className="stake-box">
      <strong>Stake play points on this leftover claim</strong>
      <p className="hint">
        For = the contested sentence is about right. Against = it overreaches. Shared premises are
        not on the table.
      </p>
      <div className="sides">
        <button
          type="button"
          className={`btn small ${side === 'for' ? 'sage' : 'secondary'}`}
          onClick={() => setSide('for')}
        >
          For
        </button>
        <button
          type="button"
          className={`btn small ${side === 'against' ? 'amber' : 'secondary'}`}
          onClick={() => setSide('against')}
        >
          Against
        </button>
      </div>
      <div className="presets" role="group" aria-label="Stake size">
        {STAKE_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`preset ${preset === amount ? 'active' : ''}`}
            onClick={() => setAmount(preset)}
            disabled={wallet.balance < preset}
          >
            {preset}
          </button>
        ))}
      </div>
      <button className="btn" type="button" onClick={onStake} disabled={!canAfford}>
        Stake {formatPoints(amount)} points {side}
      </button>
      {!canAfford ? (
        <p className="hint">
          You need at least {MIN_STAKE} points. Current balance: {formatPoints(wallet.balance)}.
        </p>
      ) : null}
      {error ? <p className="alert">{error}</p> : null}
    </div>
  )
}
