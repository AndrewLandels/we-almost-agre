import { buildQuotePayload, parseSymbolQuery } from '../../src/lib/markets/quoteApi'

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

  const symbols = parseSymbolQuery(new URL(request.url).searchParams.get('symbols'))
  if (!symbols.length) {
    return json(400, { error: 'Pass symbols as a comma-separated list, e.g. ?symbols=SPY,GLD' }, 'no-store')
  }

  try {
    const payload = await buildQuotePayload(symbols)
    return json(200, payload, 'public, max-age=30')
  } catch (error) {
    return json(
      502,
      {
        error: 'The public price feed could not be reached.',
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
