import type { IncomingMessage, ServerResponse } from 'node:http'
import { parseStatementParam, searchPolymarket } from '../src/lib/markets/polymarket'

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', status === 200 ? 'public, max-age=60' : 'no-store')
  res.end(JSON.stringify(body))
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method && req.method !== 'GET') {
    send(res, 405, { error: 'Method not allowed' })
    return
  }

  const host = req.headers.host ?? 'localhost'
  const url = new URL(req.url ?? '/api/polymarket', `http://${host}`)
  const statement = parseStatementParam(url.searchParams.get('q'))

  if (!statement) {
    send(res, 400, { error: 'Pass a statement as q.' })
    return
  }

  try {
    const payload = await searchPolymarket(statement)
    send(res, 200, payload)
  } catch (error) {
    send(res, 502, {
      error: 'The live market search could not be reached.',
      detail: error instanceof Error ? error.message : 'unknown',
    })
  }
}
