import { describe, expect, it } from 'vitest'
import { agreementPercent, buildCrowd, CROWD_MIN, gapAt } from './score'
import type { Answer } from './types'

describe('agreementPercent', () => {
  it('matches the concept worked example', () => {
    const you: Answer[] = [1, 1, -1]
    const friend: Answer[] = [1, 0, 1]
    expect(gapAt(you[0], friend[0])).toBe(0)
    expect(gapAt(you[1], friend[1])).toBe(0.5)
    expect(gapAt(you[2], friend[2])).toBe(1)
    expect(agreementPercent(you, friend)).toBe(50)
  })

  it('is 100 when every answer matches and 0 when every answer is opposite', () => {
    expect(agreementPercent([1, 0, -1], [1, 0, -1])).toBe(100)
    expect(agreementPercent([1, 1, 1], [-1, -1, -1])).toBe(0)
  })

  it('rounds a single step of difference to 83', () => {
    expect(agreementPercent([1, 1, 1], [1, 1, 0])).toBe(83)
  })
})

describe('buildCrowd', () => {
  const agree: Answer[] = [1, 1, 1]
  const middle: Answer[] = [0, 0, 0]

  it('stays hidden below 30 responses', () => {
    expect(buildCrowd(middle, Array.from({ length: CROWD_MIN - 1 }, () => agree))).toBeNull()
  })

  it('opens at 30 and reports the middle comparison', () => {
    const responses = [...Array.from({ length: 29 }, () => agree), middle]
    const crowd = buildCrowd(middle, responses)
    expect(crowd).not.toBeNull()
    expect(crowd?.responses).toBe(30)
    expect(crowd?.statements[0]).toEqual({ agree: 97, unsure: 3, disagree: 0 })
    expect(crowd?.closerToMiddleThan).toBe(97)
  })

  it('omits the personal middle line when there is no viewer', () => {
    const responses = Array.from({ length: 30 }, () => agree)
    expect(buildCrowd(null, responses)?.closerToMiddleThan).toBeNull()
  })
})
