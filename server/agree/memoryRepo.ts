import { STARTER_TOPICS } from '../../src/lib/agree/topics'
import type { Answer, StoredTopic } from '../../src/lib/agree/types'
import { DuplicateCodeError, type AgreeRepo, type ComparisonRow, type EventName } from './repo'

type EventRow = { name: EventName; topicId: string; code: string; at: string }

export type MemoryData = {
  topics: StoredTopic[]
  comparisons: ComparisonRow[]
  events: EventRow[]
}

export function createMemoryRepo(data?: Partial<MemoryData>): AgreeRepo {
  const state: MemoryData = {
    topics: data?.topics ?? STARTER_TOPICS.map((topic) => ({ ...topic, statements: topic.statements.map((s) => ({ ...s })) })),
    comparisons: data?.comparisons ?? [],
    events: data?.events ?? [],
  }

  return {
    async listTopics() {
      return state.topics.filter((topic) => topic.approved).sort((a, b) => a.sortOrder - b.sortOrder)
    },
    async getTopic(id) {
      return state.topics.find((topic) => topic.id === id && topic.approved) ?? null
    },
    async insertComparison(row) {
      if (state.comparisons.some((item) => item.code === row.code)) throw new DuplicateCodeError()
      state.comparisons.push(row)
    },
    async getByCode(code) {
      return state.comparisons.find((item) => item.code === code) ?? null
    },
    async setFriendAnswers(code, answers, tokenHash, completedAt) {
      const row = state.comparisons.find((item) => item.code === code)
      if (!row || row.friendAnswers || completedAt.length === 0) return false
      row.friendAnswers = answers
      row.friendTokenHash = tokenHash
      return true
    },
    async incrementShare(code) {
      const row = state.comparisons.find((item) => item.code === code)
      if (row) row.shareCount += 1
    },
    async addEvent(name, topicId, code, at) {
      state.events.push({ name, topicId, code, at })
    },
    async countStartsSince(iso) {
      return state.events.filter((event) => event.name === 'started' && event.at >= iso).length
    },
    async listAnswerSets(topicId) {
      const sets: Answer[][] = []
      for (const row of state.comparisons) {
        if (row.topicId !== topicId) continue
        sets.push(row.originAnswers)
        if (row.friendAnswers) sets.push(row.friendAnswers)
      }
      return sets
    },
  }
}
