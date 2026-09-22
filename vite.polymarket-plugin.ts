import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
import { parseStatementParam, searchPolymarket } from './src/lib/markets/polymarket'

async function handlePolymarket(
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
) {
  const url = req.url ?? ''
  if (!url.startsWith('/api/polymarket')) {
    next()
    return
  }
  if (req.method && req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const parsed = new URL(url, 'http://localhost')
  const statement = parseStatementParam(parsed.searchParams.get('q'))
  if (!statement) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Pass a statement as q.' }))
    return
  }

  try {
    const payload = await searchPolymarket(statement)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.end(JSON.stringify(payload))
  } catch (error) {
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error: 'The live market search could not be reached.',
        detail: error instanceof Error ? error.message : 'unknown',
      }),
    )
  }
}

/** Serves /api/polymarket during `npm run dev` and `npm run preview`, matching the Vercel function. */
export function polymarketApiPlugin(): Plugin {
  return {
    name: 'waa-polymarket-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handlePolymarket(req, res, next)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        void handlePolymarket(req, res, next)
      })
    },
  }
}
