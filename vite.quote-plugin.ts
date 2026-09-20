import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
import { handleQuoteRequest } from './api/quote-core.js'

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

  try {
    const host = req.headers.host ?? 'localhost'
    const request = new Request(new URL(url, `http://${host}`), {
      method: req.method ?? 'GET',
    })
    const response = await handleQuoteRequest(request)
    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })
    res.end(await response.text())
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
