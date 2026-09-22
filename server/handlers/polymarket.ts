import { parseStatementParam, searchPolymarket } from '../../src/lib/markets/polymarket'

function json(status: number, body: unknown, cache: string): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': cache },
  })
}

async function handle(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return json(405, { error: 'Method not allowed' }, 'no-store')
  }

  const statement = parseStatementParam(new URL(request.url).searchParams.get('q'))
  if (!statement) {
    return json(400, { error: 'Pass a statement as q.' }, 'no-store')
  }

  try {
    const payload = await searchPolymarket(statement)
    return json(200, payload, 'public, max-age=60')
  } catch (error) {
    return json(
      502,
      {
        error: 'The live market search could not be reached.',
        detail: error instanceof Error ? error.message : 'unknown',
      },
      'no-store',
    )
  }
}

export function GET(request: Request): Promise<Response> {
  return handle(request)
}

export default {
  fetch(request: Request): Promise<Response> {
    return handle(request)
  },
}
