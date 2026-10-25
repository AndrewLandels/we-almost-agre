import type { Answer, AnswerResult, ComparisonView, CreateResult, Topic } from './types'

const STORAGE_KEY = 'waa.agree.tokens.v1'

type TokenBook = Record<string, { owner?: string; friend?: string }>

function readBook(): TokenBook {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as TokenBook
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function tokensFor(code: string): { owner?: string; friend?: string } {
  return readBook()[code] ?? {}
}

export function rememberToken(code: string, role: 'owner' | 'friend', token: string) {
  const book = readBook()
  book[code] = { ...book[code], [role]: token }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(book))
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  const body = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok) throw new Error(body.error || 'Something went wrong. Please try again.')
  return body as T
}

function headersFor(code: string): HeadersInit {
  const tokens = tokensFor(code)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (tokens.owner) headers['x-owner-token'] = tokens.owner
  if (tokens.friend) headers['x-friend-token'] = tokens.friend
  return headers
}

export function fetchTopics(): Promise<{ topics: Topic[] }> {
  return request('/api/agree?action=topics')
}

export function createComparison(topicId: string, answers: Answer[]): Promise<CreateResult> {
  return request('/api/agree?action=comparison', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId, answers }),
  })
}

export function fetchComparison(code: string): Promise<ComparisonView> {
  return request(`/api/agree?action=comparison&code=${encodeURIComponent(code)}`, {
    headers: headersFor(code),
  })
}

export function submitFriendAnswers(code: string, answers: Answer[]): Promise<AnswerResult> {
  return request(`/api/agree?action=answer&code=${encodeURIComponent(code)}`, {
    method: 'POST',
    headers: headersFor(code),
    body: JSON.stringify({ answers }),
  })
}

export function recordShare(code: string): Promise<{ ok: boolean }> {
  return request(`/api/agree?action=share&code=${encodeURIComponent(code)}`, {
    method: 'POST',
    headers: headersFor(code),
  })
}

export function absoluteShareUrl(sharePath: string): string {
  return new URL(sharePath, window.location.origin).toString()
}
