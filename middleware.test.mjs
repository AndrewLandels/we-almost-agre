import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import middleware, { config, isShareCrawler, shouldRewriteSharePreview } from './middleware.js'
import { isShareCrawler as specCrawler, shouldRewriteSharePreview as specRewrite } from './src/lib/agree/crawlers.ts'

const samples = [
  ['WhatsApp/2.23.20.0', '/agree/c/abc', true],
  ['Twitterbot/1.0', '/agree/c/abc', true],
  ['facebookexternalhit/1.1', '/agree/c/abc', true],
  [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/23.1.75',
    '/agree/c/abc',
    false,
  ],
  [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15E148 Safari/604.1',
    '/agree/c/abc',
    false,
  ],
  ['Twitterbot/1.0', '/agree', false],
  ['Googlebot/2.1 (+http://www.google.com/bot.html)', '/agree/c/code-1', true],
  [null, '/agree/c/abc', false],
]

describe('share link middleware', () => {
  it('stays free of the imports that crash Routing Middleware', () => {
    const source = readFileSync(new URL('./middleware.js', import.meta.url), 'utf8')
    expect(source).not.toMatch(/^\s*import\s/m)
    expect(source).not.toMatch(/from\s+['"]@vercel\/functions['"]/)
    expect(source).not.toMatch(/from\s+['"][^'"]*crawlers/)
    expect(source).toContain('x-middleware-next')
    expect(source).toContain('x-middleware-rewrite')
    expect(config.runtime).toBe('nodejs')
    expect(config.matcher).toEqual(['/agree/c/:code'])
  })

  it('matches the typed crawler spec', () => {
    for (const [ua, pathname, rewrite] of samples) {
      expect(isShareCrawler(ua)).toBe(specCrawler(ua))
      expect(shouldRewriteSharePreview(ua, pathname)).toBe(specRewrite(ua, pathname))
      expect(shouldRewriteSharePreview(ua, pathname)).toBe(rewrite)
    }
  })

  it('continues browsers to the SPA and rewrites crawlers to the preview', () => {
    const browser = middleware(
      new Request('https://www.wealmostagree.com/agree/c/abc', {
        headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
      }),
    )
    expect(browser.headers.get('x-middleware-next')).toBe('1')
    expect(browser.headers.get('x-middleware-rewrite')).toBeNull()

    const bot = middleware(
      new Request('https://www.wealmostagree.com/agree/c/abc', {
        headers: { 'user-agent': 'Twitterbot/1.0' },
      }),
    )
    expect(bot.headers.get('x-middleware-next')).toBeNull()
    expect(bot.headers.get('x-middleware-rewrite')).toBe('https://www.wealmostagree.com/api/agree-preview?code=abc')

    const whatsApp = middleware(
      new Request('https://www.wealmostagree.com/agree/c/abc', {
        headers: { 'user-agent': 'WhatsApp/2.23.20.0' },
      }),
    )
    expect(whatsApp.headers.get('x-middleware-rewrite')).toBe('https://www.wealmostagree.com/api/agree-preview?code=abc')
  })
})
