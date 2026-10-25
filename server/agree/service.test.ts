import { describe, expect, it } from 'vitest'
import type { Answer } from '../../src/lib/agree/types'
import { createMemoryRepo, type MemoryData } from './memoryRepo'
import { AgreeError, createAgreeService } from './service'

const you: Answer[] = [1, 1, -1]
const friend: Answer[] = [1, 0, 1]

function harness(startLimit = 300) {
  const data: Pick<MemoryData, 'comparisons' | 'events'> = {
    comparisons: [],
    events: [],
  }
  let tick = 0
  let clock = new Date('2026-10-25T12:00:00.000Z')
  const repo = createMemoryRepo(data)
  const service = createAgreeService(repo, {
    now: () => clock,
    startLimit,
    randomBytes(size) {
      tick += 1
      const bytes = new Uint8Array(size)
      bytes[0] = tick
      bytes[1] = size
      return bytes
    },
  })
  return {
    data,
    service,
    advance(ms: number) {
      clock = new Date(clock.getTime() + ms)
    },
  }
}

describe('agreement service', () => {
  it('hides the first answers until the friend has replied', async () => {
    const { service } = harness()
    const created = await service.createComparison('tipping', you)
    const invite = await service.getComparison(created.code, {})
    expect(invite.status).toBe('invite')
    expect(JSON.stringify(invite)).not.toContain('originAnswers')
    expect(JSON.stringify(invite)).not.toContain('"yourAnswers"')

    const waiting = await service.getComparison(created.code, { owner: created.ownerToken })
    expect(waiting.status).toBe('waiting')
    if (waiting.status === 'waiting') expect(waiting.yourAnswers).toEqual(you)

    const answered = await service.submitFriend(created.code, friend)
    expect(answered.comparison.status).toBe('result')
    if (answered.comparison.status === 'result') {
      expect(answered.comparison.percent).toBe(50)
      expect(answered.comparison.youAre).toBe('friend')
      expect(answered.comparison.crowd).toBeNull()
    }

    const ownerView = await service.getComparison(created.code, { owner: created.ownerToken })
    expect(ownerView.status).toBe('result')
    if (ownerView.status === 'result') expect(ownerView.youAre).toBe('origin')

    await expect(service.submitFriend(created.code, friend)).rejects.toMatchObject({ status: 409 })
  })

  it('expires the link after 30 days and keeps answers off the page', async () => {
    const { service, advance } = harness()
    const created = await service.createComparison('tipping', you)
    advance(30 * 24 * 60 * 60 * 1000 + 1000)
    const view = await service.getComparison(created.code, { owner: created.ownerToken })
    expect(view.status).toBe('expired')
    expect(JSON.stringify(view)).not.toContain('yourAnswers')
    await expect(service.submitFriend(created.code, friend)).rejects.toBeInstanceOf(AgreeError)
  })

  it('records started, completed, and shared', async () => {
    const { service, data } = harness()
    const created = await service.createComparison('cash-vs-card', [0, 0, 0])
    await service.recordShare(created.code)
    await service.submitFriend(created.code, [1, 0, -1])
    expect(data.events.map((event) => event.name)).toEqual(['started', 'shared', 'completed'])
    expect(data.comparisons[0].shareCount).toBe(1)
  })

  it('shows the crowd once 30 people have answered', async () => {
    const { service } = harness()
    const first = await service.createComparison('tipping', [1, 1, 1])
    const early = await service.submitFriend(first.code, [1, 1, 1])
    if (early.comparison.status !== 'result') throw new Error('expected a result')
    expect(early.comparison.crowd).toBeNull()

    for (let i = 0; i < 27; i++) await service.createComparison('tipping', [1, 1, 1])
    const last = await service.createComparison('tipping', [0, 0, 0])
    const opened = await service.submitFriend(last.code, [0, 0, 0])
    if (opened.comparison.status !== 'result') throw new Error('expected a result')
    expect(opened.comparison.crowd?.responses).toBe(31)
    expect(opened.comparison.crowd?.closerToMiddleThan).toBeGreaterThan(50)
  })

  it('refuses an unapproved topic and slows a burst of new comparisons', async () => {
    const { service } = harness(1)
    await service.createComparison('tipping', you)
    await expect(service.createComparison('tipping', you)).rejects.toMatchObject({ status: 429 })
    await expect(service.createComparison('not-a-topic', you)).rejects.toMatchObject({ status: 404 })
  })
})
