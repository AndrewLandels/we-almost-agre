import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Connect, Plugin } from 'vite'

function readBody(req: IncomingMessage): Promise<Uint8Array | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD') return Promise.resolve(undefined)
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

type Repo = {
  // Structural type so this plugin file does not import the server graph.
}

type DevApi = {
  createFileRepo: () => Promise<Repo>
  handleAgreeRequest: (request: Request, repo: Repo) => Promise<Response>
  handlePreviewRequest: (request: Request, repo: Repo) => Promise<Response>
  renderOg: (request: Request) => Promise<Response>
}

async function loadDevApi(): Promise<DevApi> {
  const esbuild = await import('esbuild')
  const outfile = path.join(process.cwd(), 'node_modules', '.cache', 'waa-agree-dev.mjs')
  await esbuild.build({
    entryPoints: [path.join(process.cwd(), 'server', 'agree', 'devEntry.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    packages: 'external',
    outfile,
    logLevel: 'silent',
  })
  return import(pathToFileURL(outfile).href) as Promise<DevApi>
}

async function dispatch(request: Request, repo: Repo, api: DevApi): Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/agree-og')) return api.renderOg(request)
  if (url.pathname.startsWith('/api/agree-preview')) return api.handlePreviewRequest(request, repo)
  return api.handleAgreeRequest(request, repo)
}

async function handle(
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
  ready: Promise<{ repo: Repo; api: DevApi }>,
) {
  const url = req.url ?? ''
  if (!url.startsWith('/api/agree')) {
    next()
    return
  }
  try {
    const { repo, api } = await ready
    const headers = new Headers()
    const contentType = req.headers['content-type']
    if (typeof contentType === 'string') headers.set('content-type', contentType)
    const owner = req.headers['x-owner-token']
    const friend = req.headers['x-friend-token']
    if (typeof owner === 'string') headers.set('x-owner-token', owner)
    if (typeof friend === 'string') headers.set('x-friend-token', friend)
    const request = new Request(`http://${req.headers.host ?? 'localhost'}${url}`, {
      method: req.method,
      headers,
      body: await readBody(req),
    })
    const response = await dispatch(request, repo, api)
    const bytes = Buffer.from(await response.arrayBuffer())
    res.statusCode = response.status
    const type = response.headers.get('content-type')
    if (type) res.setHeader('Content-Type', type)
    res.setHeader('Cache-Control', response.headers.get('cache-control') || 'no-store')
    res.end(bytes)
  } catch (error) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Agreement Gap failed.' }))
  }
}

export function agreeApiPlugin(): Plugin {
  return {
    name: 'waa-agree-api',
    configureServer(server) {
      if (process.env.VITEST) return
      const ready = loadDevApi().then(async (api) => ({ api, repo: await api.createFileRepo() }))
      server.middlewares.use((req, res, next) => {
        void handle(req, res, next, ready)
      })
    },
    configurePreviewServer(server) {
      const ready = loadDevApi().then(async (api) => ({ api, repo: await api.createFileRepo() }))
      server.middlewares.use((req, res, next) => {
        void handle(req, res, next, ready)
      })
    },
  }
}
