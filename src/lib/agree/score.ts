import type { Answer, Crowd, CrowdStatement } from './types'

export const CROWD_MIN = 30
export const LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000
export const START_LIMIT_PER_HOUR = 300

/** 100 × (1 − mean(|A − B| / 2)). Agree = +1, Unsure = 0, Disagree = −1. */
export function agreementPercent(a: readonly Answer[], b: readonly Answer[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]) / 2
  const mean = sum / a.length
  return Math.round(100 * (1 - mean))
}

export function gapAt(a: Answer, b: Answer): number {
  return Math.abs(a - b) / 2
}

export function polarisation(answers: readonly Answer[]): number {
  let total = 0
  for (const value of answers) total += Math.abs(value)
  return total / answers.length
}

function shares(counts: number[], total: number): number[] {
  if (total <= 0) return counts.map(() => 0)
  const raw = counts.map((count) => (count * 100) / total)
  const floors = raw.map((value) => Math.floor(value))
  let left = 100 - floors.reduce((sum, value) => sum + value, 0)
  const order = raw
    .map((value, index) => ({ index, frac: value - floors[index] }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index)
  for (let i = 0; i < left; i++) floors[order[i].index] += 1
  return floors
}

export function buildCrowd(viewer: readonly Answer[] | null, responses: readonly Answer[][]): Crowd | null {
  if (responses.length < CROWD_MIN) return null
  const statements: CrowdStatement[] = [0, 1, 2].map((index) => {
    let agree = 0
    let unsure = 0
    let disagree = 0
    for (const answers of responses) {
      const value = answers[index]
      if (value === 1) agree += 1
      else if (value === 0) unsure += 1
      else disagree += 1
    }
    const [agreePct, unsurePct, disagreePct] = shares([agree, unsure, disagree], responses.length)
    return { agree: agreePct, unsure: unsurePct, disagree: disagreePct }
  })

  let closerToMiddleThan: number | null = null
  if (viewer) {
    const mine = polarisation(viewer)
    const further = responses.filter((answers) => polarisation(answers) > mine + 1e-9).length
    closerToMiddleThan = Math.round((100 * further) / responses.length)
  }

  return { responses: responses.length, statements, closerToMiddleThan }
}
