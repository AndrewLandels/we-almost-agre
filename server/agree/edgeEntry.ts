import { handleAgreeRequest } from './http'
import { createSupabaseRepoFromEnv, readSupabaseConfig } from './supabaseRepo'

declare const Deno: {
  serve(handler: (request: Request) => Response | Promise<Response>): void
  env: { get(name: string): string | undefined }
}

Deno.serve(async (request) => {
  const secret = Deno.env.get('AGREE_EDGE_SECRET')
  if (secret && request.headers.get('x-agree-secret') !== secret) {
    return Response.json({ error: 'Unauthorised.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }
  if (!readSupabaseConfig()) {
    return Response.json(
      { error: 'The database is not configured.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
  return handleAgreeRequest(request, createSupabaseRepoFromEnv())
})
