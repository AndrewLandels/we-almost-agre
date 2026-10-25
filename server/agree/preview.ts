import { shareTitle } from '../../src/lib/agree/present'
import type { ComparisonView } from '../../src/lib/agree/types'
import { handleAgreeRequest } from './http'
import type { AgreeRepo } from './repo'
import { edgeUrl } from './runtime'

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&#39;'
    }
  })
}

export async function loadPublicComparison(code: string, repo: AgreeRepo | null): Promise<ComparisonView | null> {
  if (repo) {
    const response = await handleAgreeRequest(new Request(`https://wealmostagree.com/api/agree?action=comparison&code=${encodeURIComponent(code)}`), repo)
    if (response.status === 404) return null
    if (!response.ok) return null
    return (await response.json()) as ComparisonView
  }
  const target = new URL(edgeUrl())
  target.searchParams.set('action', 'comparison')
  target.searchParams.set('code', code)
  const response = await fetch(target)
  if (!response.ok) return null
  return (await response.json()) as ComparisonView
}

function topicTitle(view: ComparisonView): string {
  return view.topic.title
}

export function renderPreviewHtml(origin: string, code: string, view: ComparisonView | null): string {
  const topic = view ? topicTitle(view) : 'a topic'
  const percent = view?.status === 'result' ? view.percent : null
  const title = view ? shareTitle(topic, percent) : 'We Almost Agree'
  const description =
    percent === null
      ? 'Three taps. No login. See where you split, and the common ground you already share.'
      : `You agree ${percent}% on ${topic}. See the gap, then the common ground.`
  const image = new URL('/api/agree-og', origin)
  image.searchParams.set('mode', percent === null ? 'invite' : 'result')
  image.searchParams.set('topic', topic.slice(0, 80))
  if (percent !== null) image.searchParams.set('percent', String(percent))
  const page = `${origin}/agree/c/${encodeURIComponent(code)}`
  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)
  const heading = view?.status === 'expired' ? 'This link has expired' : safeTitle

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  <meta name="robots" content="noindex" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_GB" />
  <meta property="og:site_name" content="We Almost Agree" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:url" content="${escapeHtml(page)}" />
  <meta property="og:image" content="${escapeHtml(image.toString())}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${escapeHtml(image.toString())}" />
</head>
<body>
  <main>
    <p>We Almost Agree</p>
    <h1>${heading}</h1>
    <p>${safeDescription}</p>
  </main>
</body>
</html>`
}

export async function handlePreviewRequest(request: Request, repo: AgreeRepo | null): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')?.trim() ?? ''
  const view = code ? await loadPublicComparison(code, repo) : null
  const html = renderPreviewHtml(url.origin, code, view)
  return new Response(html, {
    status: view || !code ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}
