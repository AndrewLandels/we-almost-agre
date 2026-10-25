import type { Answer, Topic, ViewerRole } from './types'
import { gapAt } from './score'

export function answerLabel(answer: Answer): 'Agree' | 'Unsure' | 'Disagree' {
  if (answer === 1) return 'Agree'
  if (answer === 0) return 'Unsure'
  return 'Disagree'
}

export function agreementHeadline(percent: number, youAre: ViewerRole): string {
  const figure = `${percent}%`
  return youAre === 'either' ? `They agree ${figure}` : `You agree ${figure}`
}

export type BreakdownRow = {
  text: string
  gap: number
  you: Answer
  them: Answer
  summary: string
  distance: string
}

function person(answer: Answer, youAre: ViewerRole, side: 'you' | 'them'): string {
  const label = answerLabel(answer).toLowerCase()
  if (youAre === 'either') return side === 'you' ? `One person: ${label}` : `The other: ${label}`
  if (label === 'unsure') return side === 'you' ? 'You are unsure' : 'They are unsure'
  const verb = label === 'agree' ? 'agree' : 'disagree'
  return side === 'you' ? `You ${verb}` : `They ${verb}`
}

export function breakdown(topic: Topic, you: readonly Answer[], them: readonly Answer[], youAre: ViewerRole): BreakdownRow[] {
  return topic.statements.map((statement, index) => {
    const gap = gapAt(you[index], them[index])
    const yours = person(you[index], youAre, 'you')
    const theirs = person(them[index], youAre, 'them')
    let summary: string
    if (gap === 0) {
      if (youAre === 'either') {
        summary = you[index] === 0 ? 'Both are unsure.' : `Both ${answerLabel(you[index]).toLowerCase()}.`
      } else if (you[index] === 0) summary = "You're both unsure."
      else summary = `You both ${answerLabel(you[index]).toLowerCase()}.`
    } else {
      summary = `${yours}. ${theirs}.`
    }
    return {
      text: statement.text,
      gap,
      you: you[index],
      them: them[index],
      summary,
      distance: gap === 0 ? 'Same answer' : gap === 0.5 ? 'A step apart' : 'Opposite sides',
    }
  })
}

export function commonGround(rows: readonly BreakdownRow[]): BreakdownRow[] {
  return rows.filter((row) => row.gap === 0)
}

export function splits(rows: readonly BreakdownRow[]): BreakdownRow[] {
  return rows.filter((row) => row.gap > 0).sort((a, b) => b.gap - a.gap)
}

export function closingLine(commonCount: number): string {
  if (commonCount >= 3) return 'You match on all three. That is a gentle kind of rare.'
  if (commonCount === 2) return 'You already share two of the three. Start the conversation there.'
  if (commonCount === 1) return 'You already share one. It is a small patch of common ground, and it is real.'
  return 'You split on all three. The gap is clear, which makes the next topic easier to choose.'
}

export function crowdSentence(your: Answer, share: number): string {
  if (your === 1) return `You agree, with ${share}% of people.`
  if (your === -1) return `You disagree, with ${share}% of people.`
  return `You're unsure, with ${share}% of people.`
}

export function middleSentence(percent: number): string {
  if (percent >= 50) return `You are closer to the middle than ${percent}% of people on this topic.`
  return 'Most people sit closer to the middle than you do on this topic.'
}

export function shareTitle(topicTitle: string, percent: number | null): string {
  if (percent === null) return `Do we agree on ${topicTitle}?`
  return `We agree ${percent}% on ${topicTitle}`
}
