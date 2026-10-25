import { createFileRepo } from './fileRepo'
import type { AgreeRepo } from './repo'
import { createSupabaseRepoFromEnv, readSupabaseConfig } from './supabaseRepo'

/** Hosted edge function for the we-almost-agree Supabase project (eu-west-2). */
export const DEFAULT_EDGE_URL = 'https://xcedcymypsrafknfzxxz.supabase.co/functions/v1/agree'

export function edgeUrl(): string {
  return process.env.AGREE_EDGE_URL || DEFAULT_EDGE_URL
}

export async function resolveRepo(): Promise<AgreeRepo | null> {
  if (process.env.AGREE_STORE === 'file') return createFileRepo(process.env.AGREE_DATA_PATH)
  if (readSupabaseConfig()) return createSupabaseRepoFromEnv()
  return null
}

export async function proxyAgree(request: Request): Promise<Response> {
  const incoming = new URL(request.url)
  const target = new URL(edgeUrl())
  target.search = incoming.search
  const headers = new Headers()
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const owner = request.headers.get('x-owner-token')
  const friend = request.headers.get('x-friend-token')
  if (owner) headers.set('x-owner-token', owner)
  if (friend) headers.set('x-friend-token', friend)
  if (process.env.AGREE_EDGE_SECRET) headers.set('x-agree-secret', process.env.AGREE_EDGE_SECRET)
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
    })
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Agreement Gap edge proxy failed', error instanceof Error ? error.message : error)
    return Response.json(
      { error: 'The comparison service is not reachable just now.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
