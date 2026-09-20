import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
import { buildQuotePayload, parseSymbolQuery } from './src/lib/markets/quoteApi'

async function handleQuote(
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
) {
  const url = req.url ?? ''
  if (!url.startsWith('/api/quote')) {
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
  const symbols = parseSymbolQuery(parsed.searchParams.get('symbols'))
  if (!symbols.length) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Pass symbols as a comma-separated list.' }))
    return
  }

  try {
    const payload = await buildQuotePayload(symbols)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=30')
    res.end(JSON.stringify(payload))
  } catch (error) {
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error: 'The public price feed could not be reached.',
        detail: error instanceof Error ? error.message : 'unknown',
      }),
    )
  }
}

/** Serves /api/quote during `npm run dev` and `npm run preview` so local work matches Vercel. */
export function quoteApiPlugin(): Plugin {
  return {
    name: 'waa-quote-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleQuote(req, res, next)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleQuote(req, res, next)
      })
    },
  }
}
