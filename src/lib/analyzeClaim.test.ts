import { describe, expect, it } from 'vitest'
import { analyzeClaim, matchSeedClaim } from './analyzeClaim'
import { settleStake, stakeOnContested } from './points'
import { defaultWallet } from './storage'
import { SEED_CLAIMS } from '../data/seeds'

describe('analyzeClaim', () => {
  it('returns the curated seed map for the electric-car slogan', () => {
    const result = analyzeClaim('Electric cars are shit.')
    expect(result.source).toBe('seed')
    expect(result.id).toBe('electric-cars')
    expect(result.sharedPremises.length).toBeGreaterThan(0)
    expect(result.contestedClaims.length).toBeGreaterThan(0)
  })

  it('matches close wording of the Bitcoin seed', () => {
    expect(matchSeedClaim('You should buy Bitcoin')?.id).toBe('bitcoin')
  })

  it('labels free-text as a demo first-pass and keeps the later-LLM shape', () => {
    const result = analyzeClaim('Schools should ban phones entirely.')
    expect(result.source).toBe('demo')
    expect(result.topicLabel).toBe('Education')
    expect(result.sharedPremises.length).toBeGreaterThanOrEqual(2)
    expect(result.contestedClaims.length).toBeGreaterThanOrEqual(2)
    expect(result.overlapNote.toLowerCase()).toMatch(/first-pass|demo|later/)
  })

  it('rejects tiny input', () => {
    expect(() => analyzeClaim('Nope')).toThrow(/few words/i)
  })
})

describe('play-money stakes', () => {
  const ev = SEED_CLAIMS[0]

  it('allows a stake only on a contested node and deducts the balance', () => {
    const next = stakeOnContested(defaultWallet(), ev, 'ev-tco', 'against', 100)
    expect(next.balance).toBe(900)
    expect(next.openStakes).toHaveLength(1)
    expect(next.openStakes[0]?.contestedId).toBe('ev-tco')
  })

  it('refuses a second open stake on the same node', () => {
    const once = stakeOnContested(defaultWallet(), ev, 'ev-tco', 'for', 50)
    expect(() => stakeOnContested(once, ev, 'ev-tco', 'against', 50)).toThrow(/already/i)
  })

  it('settles a winning demo lean at 2x and leaves open claims alone', () => {
    const staked = stakeOnContested(defaultWallet(), ev, 'ev-tco', 'against', 100)
    const settled = settleStake(staked, ev, 'ev-tco')
    expect(settled.balance).toBe(1100)
    expect(settled.settledStakes[0]?.won).toBe(true)

    const openStake = stakeOnContested(defaultWallet(), ev, 'ev-charging', 'for', 50)
    expect(() => settleStake(openStake, ev, 'ev-charging')).toThrow(/still open/i)
  })
})
