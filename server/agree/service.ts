import { approvedTopics } from '../../src/lib/agree/topics'
import type { Answer, AnswerResult, ComparisonView, CreateResult, Topic, ViewerRole } from '../../src/lib/agree/types'
import { agreementPercent, buildCrowd, LINK_TTL_MS, START_LIMIT_PER_HOUR } from '../../src/lib/agree/score'
import type { AgreeRepo, ComparisonRow } from './repo'
import { DuplicateCodeError } from './repo'

export class AgreeError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'AgreeError'
  }
}

export type ServiceOptions = {
  now?: () => Date
  randomBytes?: (size: number) => Uint8Array
  startLimit?: number
}

function toTopic(topic: { id: string; title: string; blurb: string; statements: Topic['statements'] }): Topic {
  return {
    id: topic.id,
    title: topic.title,
    blurb: topic.blurb,
    statements: topic.statements,
  }
}

export function parseAnswers(value: unknown): Answer[] | null {
  if (!Array.isArray(value) || value.length !== 3) return null
  const answers: Answer[] = []
  for (const item of value) {
    if (item !== -1 && item !== 0 && item !== 1) return null
    answers.push(item)
  }
  return answers
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function bytesToToken(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function sharePath(code: string): string {
  return `/agree/c/${code}`
}

function isExpired(expiresAt: string, at: Date): boolean {
  return new Date(expiresAt).getTime() <= at.getTime()
}

async function present(
  repo: AgreeRepo,
  row: ComparisonRow,
  topic: Topic,
  tokens: { owner?: string | null; friend?: string | null },
  at: Date,
): Promise<ComparisonView> {
  if (isExpired(row.expiresAt, at)) {
    return { status: 'expired', topic: { id: topic.id, title: topic.title }, expiresAt: row.expiresAt }
  }
  if (!row.friendAnswers) {
    const ownerOk = tokens.owner ? safeEqual(await hashToken(tokens.owner), row.originTokenHash) : false
    if (ownerOk) {
      return {
        status: 'waiting',
        topic,
        code: row.code,
        expiresAt: row.expiresAt,
        yourAnswers: row.originAnswers,
        sharePath: sharePath(row.code),
      }
    }
    return { status: 'invite', topic, code: row.code, expiresAt: row.expiresAt }
  }

  let youAre: ViewerRole = 'either'
  if (tokens.owner && safeEqual(await hashToken(tokens.owner), row.originTokenHash)) youAre = 'origin'
  else if (tokens.friend && row.friendTokenHash && safeEqual(await hashToken(tokens.friend), row.friendTokenHash)) {
    youAre = 'friend'
  }
  const viewer =
    youAre === 'origin' ? row.originAnswers : youAre === 'friend' ? row.friendAnswers : null
  const sets = await repo.listAnswerSets(row.topicId)
  return {
    status: 'result',
    topic,
    code: row.code,
    expiresAt: row.expiresAt,
    percent: agreementPercent(row.originAnswers, row.friendAnswers),
    youAre,
    originAnswers: row.originAnswers,
    friendAnswers: row.friendAnswers,
    sharePath: sharePath(row.code),
    crowd: buildCrowd(viewer, sets),
  }
}

async function topicFor(repo: AgreeRepo, row: ComparisonRow): Promise<Topic | null> {
  const topic = await repo.getTopic(row.topicId)
  return topic ? toTopic(topic) : null
}

export function createAgreeService(repo: AgreeRepo, options: ServiceOptions = {}) {
  const now = options.now ?? (() => new Date())
  const randomBytes = options.randomBytes ?? ((size: number) => crypto.getRandomValues(new Uint8Array(size)))
  const startLimit = options.startLimit ?? START_LIMIT_PER_HOUR

  return {
    async listTopics(): Promise<Topic[]> {
      return approvedTopics(await repo.listTopics())
    },

    async createComparison(topicId: string, answers: Answer[]): Promise<CreateResult> {
      const topic = await repo.getTopic(topicId)
      if (!topic) throw new AgreeError(404, 'That topic is not available.')
      const startedAt = now()
      const recent = await repo.countStartsSince(new Date(startedAt.getTime() - 60 * 60 * 1000).toISOString())
      if (recent >= startLimit) throw new AgreeError(429, 'Too many new comparisons just now. Try again in a little while.')

      const createdAt = startedAt.toISOString()
      const expiresAt = new Date(startedAt.getTime() + LINK_TTL_MS).toISOString()
      let code = ''
      let ownerToken = ''
      for (let attempt = 0; attempt < 5; attempt++) {
        code = bytesToToken(randomBytes(16))
        ownerToken = bytesToToken(randomBytes(18))
        try {
          await repo.insertComparison({
            code,
            topicId,
            originAnswers: answers,
            friendAnswers: null,
            originTokenHash: await hashToken(ownerToken),
            friendTokenHash: null,
            createdAt,
            expiresAt,
            shareCount: 0,
          })
          break
        } catch (error) {
          if (error instanceof DuplicateCodeError && attempt < 4) continue
          throw error
        }
      }
      await repo.addEvent('started', topicId, code, createdAt)
      return { code, ownerToken, expiresAt, sharePath: sharePath(code) }
    },

    async getComparison(code: string, tokens: { owner?: string | null; friend?: string | null }): Promise<ComparisonView> {
      const row = await repo.getByCode(code)
      if (!row) throw new AgreeError(404, 'That link does not exist.')
      const topic = await topicFor(repo, row)
      if (!topic) throw new AgreeError(404, 'That topic is no longer available.')
      return present(repo, row, topic, tokens, now())
    },

    async submitFriend(code: string, answers: Answer[]): Promise<AnswerResult> {
      const row = await repo.getByCode(code)
      if (!row) throw new AgreeError(404, 'That link does not exist.')
      const current = now()
      if (isExpired(row.expiresAt, current)) {
        throw new AgreeError(410, 'This link has expired. Links last 30 days.')
      }
      if (row.friendAnswers) throw new AgreeError(409, 'Someone has already answered this link.')
      const friendToken = bytesToToken(randomBytes(18))
      const completedAt = current.toISOString()
      const saved = await repo.setFriendAnswers(code, answers, await hashToken(friendToken), completedAt)
      if (!saved) throw new AgreeError(409, 'Someone has already answered this link.')
      await repo.addEvent('completed', row.topicId, code, completedAt)
      const comparison = await this.getComparison(code, { friend: friendToken })
      return { friendToken, comparison }
    },

    async recordShare(code: string): Promise<void> {
      const row = await repo.getByCode(code)
      if (!row) throw new AgreeError(404, 'That link does not exist.')
      if (isExpired(row.expiresAt, now())) {
        throw new AgreeError(410, 'This link has expired. Links last 30 days.')
      }
      await repo.incrementShare(code)
      await repo.addEvent('shared', row.topicId, code, now().toISOString())
    },
  }
}

export type AgreeService = ReturnType<typeof createAgreeService>
