import { next, rewrite } from '@vercel/functions'
import { shouldRewriteSharePreview } from './src/lib/agree/crawlers.ts'

export const config = {
  matcher: ['/agree/c/:code'],
}

export default function middleware(request) {
  const url = new URL(request.url)
  if (!shouldRewriteSharePreview(request.headers.get('user-agent'), url.pathname)) return next()
  const code = url.pathname.split('/').filter(Boolean).pop() ?? ''
  const destination = new URL('/api/agree-preview', url.origin)
  destination.searchParams.set('code', code)
  return rewrite(destination)
}
