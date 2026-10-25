import type { Answer, StoredTopic } from '../../src/lib/agree/types'
import { DuplicateCodeError, type AgreeRepo, type ComparisonRow } from './repo'

type SupabaseConfig = { url: string; key: string }

type TopicRow = {
  id: string
  title: string
  blurb: string
  approved: boolean
  sort_order: number
  agree_statements: { id: string; position: number; body: string }[]
}

type ComparisonDb = {
  code: string
  topic_id: string
  origin_answers: Answer[]
  friend_answers: Answer[] | null
  origin_token_hash: string
  friend_token_hash: string | null
  created_at: string
  expires_at: string
  share_count: number
}

function headers(key: string, extra?: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {
    apikey: key,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...extra,
  }
  if (!key.startsWith('sb_')) result.Authorization = `Bearer ${key}`
  return result
}

async function rest<T>(config: SupabaseConfig, path: string, init?: RequestInit & { extra?: Record<string, string> }): Promise<{ data: T; response: Response }> {
  const response = await fetch(`${config.url.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...init,
    headers: headers(config.key, init?.extra),
  })
  const text = await response.text()
  const data = text ? (JSON.parse(text) as T) : (null as T)
  if (!response.ok) {
    const body = data as { code?: string; message?: string } | null
    if (response.status === 409 || body?.code === '23505') throw new DuplicateCodeError()
    throw new Error(body?.message || `Database request failed (${response.status})`)
  }
  return { data, response }
}

function mapTopic(row: TopicRow): StoredTopic {
  const statements = [...(row.agree_statements ?? [])].sort((a, b) => a.position - b.position)
  return {
    id: row.id,
    title: row.title,
    blurb: row.blurb,
    approved: row.approved,
    sortOrder: row.sort_order,
    statements: statements.map((statement) => ({ id: statement.id, text: statement.body })),
  }
}

function mapComparison(row: ComparisonDb): ComparisonRow {
  return {
    code: row.code,
    topicId: row.topic_id,
    originAnswers: row.origin_answers,
    friendAnswers: row.friend_answers,
    originTokenHash: row.origin_token_hash,
    friendTokenHash: row.friend_token_hash,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    shareCount: row.share_count,
  }
}

const TOPIC_SELECT = 'id,title,blurb,approved,sort_order,agree_statements(id,position,body)'

export function createSupabaseRepo(config: SupabaseConfig): AgreeRepo {
  return {
    async listTopics() {
      const { data } = await rest<TopicRow[]>(
        config,
        `agree_topics?approved=eq.true&select=${TOPIC_SELECT}&order=sort_order.asc`,
      )
      return data.map(mapTopic)
    },
    async getTopic(id) {
      const safe = encodeURIComponent(id)
      const { data } = await rest<TopicRow[]>(
        config,
        `agree_topics?id=eq.${safe}&approved=eq.true&select=${TOPIC_SELECT}&limit=1`,
      )
      return data[0] ? mapTopic(data[0]) : null
    },
    async insertComparison(row) {
      await rest(config, 'agree_comparisons', {
        method: 'POST',
        extra: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          code: row.code,
          topic_id: row.topicId,
          origin_answers: row.originAnswers,
          origin_token_hash: row.originTokenHash,
          created_at: row.createdAt,
          expires_at: row.expiresAt,
          share_count: row.shareCount,
        }),
      })
    },
    async getByCode(code) {
      const safe = encodeURIComponent(code)
      const { data } = await rest<ComparisonDb[]>(config, `agree_comparisons?code=eq.${safe}&select=*&limit=1`)
      return data[0] ? mapComparison(data[0]) : null
    },
    async setFriendAnswers(code, answers, tokenHash, completedAt) {
      const safe = encodeURIComponent(code)
      const { data } = await rest<ComparisonDb[]>(
        config,
        `agree_comparisons?code=eq.${safe}&friend_answers=is.null`,
        {
          method: 'PATCH',
          extra: { Prefer: 'return=representation' },
          body: JSON.stringify({
            friend_answers: answers,
            friend_token_hash: tokenHash,
            friend_completed_at: completedAt,
          }),
        },
      )
      return Array.isArray(data) && data.length > 0
    },
    async incrementShare(code) {
      const row = await this.getByCode(code)
      if (!row) return
      const safe = encodeURIComponent(code)
      await rest(config, `agree_comparisons?code=eq.${safe}`, {
        method: 'PATCH',
        extra: { Prefer: 'return=minimal' },
        body: JSON.stringify({ share_count: row.shareCount + 1 }),
      })
    },
    async addEvent(name, topicId, code, at) {
      await rest(config, 'agree_events', {
        method: 'POST',
        extra: { Prefer: 'return=minimal' },
        body: JSON.stringify({ name, topic_id: topicId, comparison_code: code, created_at: at }),
      })
    },
    async countStartsSince(iso) {
      const { response } = await rest<unknown>(
        config,
        `agree_events?name=eq.started&created_at=gte.${encodeURIComponent(iso)}&select=id`,
        { extra: { Prefer: 'count=exact', Range: '0-0' } },
      )
      const range = response.headers.get('content-range') ?? ''
      const total = range.split('/')[1]
      return Number(total ?? 0) || 0
    },
    async listAnswerSets(topicId) {
      const safe = encodeURIComponent(topicId)
      const { data } = await rest<{ origin_answers: Answer[]; friend_answers: Answer[] | null }[]>(
        config,
        `agree_comparisons?topic_id=eq.${safe}&select=origin_answers,friend_answers&limit=5000`,
      )
      const sets: Answer[][] = []
      for (const row of data) {
        sets.push(row.origin_answers)
        if (row.friend_answers) sets.push(row.friend_answers)
      }
      return sets
    },
  }
}

type EnvLike = Record<string, string | undefined>

function envGet(name: string): string | undefined {
  const fromProcess = typeof process !== 'undefined' ? (process.env as EnvLike)[name] : undefined
  if (fromProcess) return fromProcess
  const deno = (globalThis as { Deno?: { env: { get(name: string): string | undefined } } }).Deno
  return deno?.env.get(name)
}

export function readSupabaseConfig(): SupabaseConfig | null {
  const url = envGet('SUPABASE_URL')
  const direct = envGet('SUPABASE_SECRET_KEY') || envGet('SUPABASE_SERVICE_ROLE_KEY')
  if (url && direct) return { url, key: direct }
  const raw = envGet('SUPABASE_SECRET_KEYS')
  if (!url || !raw) return null
  try {
    const parsed = JSON.parse(raw) as Record<string, string>
    const key = parsed.default || Object.values(parsed)[0]
    return key ? { url, key } : null
  } catch {
    return null
  }
}

export function createSupabaseRepoFromEnv(): AgreeRepo {
  const config = readSupabaseConfig()
  if (!config) throw new Error('Supabase is not configured')
  return createSupabaseRepo(config)
}
