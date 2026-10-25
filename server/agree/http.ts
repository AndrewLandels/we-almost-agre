import { AgreeError, createAgreeService, parseAnswers } from './service'
import type { AgreeRepo } from './repo'

function json(status: number, body: unknown): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

function tokensFrom(request: Request): { owner?: string | null; friend?: string | null } {
  return {
    owner: request.headers.get('x-owner-token'),
    friend: request.headers.get('x-friend-token'),
  }
}

async function readJson(request: Request): Promise<unknown> {
  const text = await request.text()
  if (!text) return {}
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new AgreeError(400, 'That request was not valid JSON.')
  }
}

export async function handleAgreeRequest(request: Request, repo: AgreeRepo): Promise<Response> {
  const service = createAgreeService(repo)
  const url = new URL(request.url)
  const action = url.searchParams.get('action')
  const code = url.searchParams.get('code')?.trim() ?? ''

  try {
    if (request.method === 'GET' && action === 'topics') {
      return json(200, { topics: await service.listTopics() })
    }

    if (request.method === 'POST' && action === 'comparison') {
      const body = (await readJson(request)) as { topicId?: unknown; answers?: unknown }
      if (typeof body.topicId !== 'string' || !/^[a-z0-9-]{1,64}$/.test(body.topicId)) {
        throw new AgreeError(400, 'Choose a topic from the list.')
      }
      const answers = parseAnswers(body.answers)
      if (!answers) throw new AgreeError(400, 'Answer all three statements with agree, unsure, or disagree.')
      return json(201, await service.createComparison(body.topicId, answers))
    }

    if (request.method === 'GET' && action === 'comparison') {
      if (!code) throw new AgreeError(400, 'That link is missing its code.')
      return json(200, await service.getComparison(code, tokensFrom(request)))
    }

    if (request.method === 'POST' && action === 'answer') {
      if (!code) throw new AgreeError(400, 'That link is missing its code.')
      const body = (await readJson(request)) as { answers?: unknown }
      const answers = parseAnswers(body.answers)
      if (!answers) throw new AgreeError(400, 'Answer all three statements with agree, unsure, or disagree.')
      return json(200, await service.submitFriend(code, answers))
    }

    if (request.method === 'POST' && action === 'share') {
      if (!code) throw new AgreeError(400, 'That link is missing its code.')
      await service.recordShare(code)
      return json(200, { ok: true })
    }

    if (request.method !== 'GET' && request.method !== 'POST') {
      return json(405, { error: 'Method not allowed.' })
    }
    return json(404, { error: 'That action is not available.' })
  } catch (error) {
    if (error instanceof AgreeError) return json(error.status, { error: error.message })
    console.error('Agreement Gap request failed')
    return json(500, { error: 'Something went wrong. Please try again.' })
  }
}
