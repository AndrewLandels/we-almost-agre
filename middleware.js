// Plain JavaScript with no imports. Vercel Routing Middleware crashed at
// invocation (MIDDLEWARE_INVOCATION_FAILED) when this file imported
// @vercel/functions or src/lib/agree/crawlers.ts.
// Keep the crawler check in sync with src/lib/agree/crawlers.ts.

const CRAWLER =
  /Twitterbot|facebookexternalhit|Facebot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|redditbot|Iframely|embedly|SkypeUriPreview|Slack-ImgProxy|vkShare|Applebot|Googlebot|bingbot|DuckDuckBot/i

export function isShareCrawler(userAgent) {
  const ua = userAgent ?? ''
  if (CRAWLER.test(ua)) return true
  return /WhatsApp/i.test(ua) && !/Mozilla/i.test(ua)
}

export function shouldRewriteSharePreview(userAgent, pathname) {
  return /^\/agree\/c\/[^/]+$/.test(pathname) && isShareCrawler(userAgent)
}

export const config = {
  matcher: ['/agree/c/:code'],
  // Edge is deprecated and crashes this file on invocation. Node.js is the
  // runtime that honours x-middleware-rewrite / x-middleware-next.
  runtime: 'nodejs',
}

export default function middleware(request) {
  const url = new URL(request.url)
  if (!shouldRewriteSharePreview(request.headers.get('user-agent'), url.pathname)) {
    return new Response(null, {
      headers: { 'x-middleware-next': '1' },
    })
  }
  const code = url.pathname.split('/').filter(Boolean).pop() ?? ''
  const destination = new URL('/api/agree-preview', url.origin)
  destination.searchParams.set('code', code)
  return new Response(null, {
    headers: { 'x-middleware-rewrite': destination.toString() },
  })
}
