import { describe, expect, it } from 'vitest'
import { STARTER_TOPICS } from './topics'
import { breakdown, closingLine, commonGround, crowdSentence, middleSentence, splits } from './present'
import type { Answer } from './types'

const tipping = STARTER_TOPICS.find((topic) => topic.id === 'tipping')!

describe('result copy', () => {
  const you: Answer[] = [1, 1, -1]
  const friend: Answer[] = [1, 0, 1]

  it('shows common ground before the splits and ends on agreement', () => {
    const rows = breakdown(tipping, you, friend, 'origin')
    expect(commonGround(rows).map((row) => row.text)).toEqual([tipping.statements[0].text])
    expect(splits(rows).map((row) => row.gap)).toEqual([1, 0.5])
    expect(commonGround(rows)[0].summary).toBe('You both agree.')
    expect(closingLine(1)).toMatch(/share one/)
    expect(closingLine(0)).toMatch(/next topic/)
    expect(closingLine(3)).toMatch(/all three/)
  })

  it('keeps the friend as "you" on their own screen', () => {
    const rows = breakdown(tipping, friend, you, 'friend')
    expect(rows[1].summary).toBe('You are unsure. They agree.')
  })

  it('phrases the crowd without naming anyone', () => {
    expect(crowdSentence(1, 62)).toBe('You agree, with 62% of people.')
    expect(middleSentence(70)).toMatch(/closer to the middle than 70%/)
    expect(middleSentence(10)).toMatch(/closer to the middle than you/)
  })
})
