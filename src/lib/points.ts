import type { ClaimAnalysis, OpenStake, StakeSide, Wallet } from '../types'

export const MIN_STAKE = 25
export const STAKE_PRESETS = [25, 50, 100, 250] as const

export function stakeOnContested(
  wallet: Wallet,
  analysis: ClaimAnalysis,
  contestedId: string,
  side: StakeSide,
  amount: number,
): Wallet {
  const node = analysis.contestedClaims.find((claim) => claim.id === contestedId)
  if (!node) {
    throw new Error('You can only stake on a contested claim.')
  }

  if (!Number.isFinite(amount) || amount < MIN_STAKE) {
    throw new Error(`Minimum stake is ${MIN_STAKE} points.`)
  }

  if (amount > wallet.balance) {
    throw new Error('Not enough points left in this season.')
  }

  if (wallet.openStakes.some((stake) => stake.contestedId === contestedId)) {
    throw new Error('You already have an open stake on this claim.')
  }

  const nextStake: OpenStake = {
    claimId: analysis.id,
    contestedId,
    side,
    amount,
    placedAt: new Date().toISOString(),
  }

  return {
    ...wallet,
    balance: wallet.balance - amount,
    openStakes: [...wallet.openStakes, nextStake],
  }
}

export function settleStake(wallet: Wallet, analysis: ClaimAnalysis, contestedId: string): Wallet {
  const node = analysis.contestedClaims.find((claim) => claim.id === contestedId)
  const open = wallet.openStakes.find((stake) => stake.contestedId === contestedId)

  if (!node || !open) {
    throw new Error('No open stake to settle on this claim.')
  }
  if (node.demoResolution === 'open') {
    throw new Error('This claim is still open — no demo lean to settle against yet.')
  }

  const won = open.side === node.demoResolution
  const payout = won ? open.amount * 2 : 0

  return {
    ...wallet,
    balance: wallet.balance + payout,
    openStakes: wallet.openStakes.filter((stake) => stake.contestedId !== contestedId),
    settledStakes: [
      ...wallet.settledStakes,
      {
        ...open,
        resolvedAs: node.demoResolution,
        payout,
        won,
        settledAt: new Date().toISOString(),
      },
    ],
  }
}

export function stakeForNode(wallet: Wallet, contestedId: string): OpenStake | undefined {
  return wallet.openStakes.find((stake) => stake.contestedId === contestedId)
}

export function settledForNode(wallet: Wallet, contestedId: string) {
  return wallet.settledStakes.find((stake) => stake.contestedId === contestedId)
}

export function formatPoints(value: number): string {
  return new Intl.NumberFormat('en-GB').format(value)
}
