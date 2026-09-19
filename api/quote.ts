import type { IncomingMessage, ServerResponse } from 'node:http'
import { buildQuotePayload, parseSymbolQuery } from '../src/lib/markets/quoteApi'

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=30')
  res.end(JSON.stringify(body))
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method && req.method !== 'GET') {
    send(res, 405, { error: 'Method not allowed' })
    return
  }

  const host = req.headers.host ?? 'localhost'
  const url = new URL(req.url ?? '/api/quote', `http://${host}`)
  const symbols = parseSymbolQuery(url.searchParams.get('symbols'))

  if (!symbols.length) {
    send(res, 400, { error: 'Pass symbols as a comma-separated list, e.g. ?symbols=SPY,GLD' })
    return
  }

  try {
    const payload = await buildQuotePayload(symbols)
    send(res, 200, payload)
  } catch (error) {
    send(res, 502, {
      error: 'The public price feed could not be reached.',
      detail: error instanceof Error ? error.message : 'unknown',
    })
  }
}
