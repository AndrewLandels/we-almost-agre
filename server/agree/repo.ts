import type { Answer, StoredTopic } from '../../src/lib/agree/types'

export type ComparisonRow = {
  code: string
  topicId: string
  originAnswers: Answer[]
  friendAnswers: Answer[] | null
  originTokenHash: string
  friendTokenHash: string | null
  createdAt: string
  expiresAt: string
  shareCount: number
}

export type EventName = 'started' | 'completed' | 'shared'

export class DuplicateCodeError extends Error {
  constructor() {
    super('duplicate code')
    this.name = 'DuplicateCodeError'
  }
}

export interface AgreeRepo {
  listTopics(): Promise<StoredTopic[]>
  getTopic(id: string): Promise<StoredTopic | null>
  insertComparison(row: ComparisonRow): Promise<void>
  getByCode(code: string): Promise<ComparisonRow | null>
  setFriendAnswers(code: string, answers: Answer[], tokenHash: string, completedAt: string): Promise<boolean>
  incrementShare(code: string): Promise<void>
  addEvent(name: EventName, topicId: string, code: string, at: string): Promise<void>
  countStartsSince(iso: string): Promise<number>
  listAnswerSets(topicId: string): Promise<Answer[][]>
}
