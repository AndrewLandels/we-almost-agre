import { describe, expect, it } from 'vitest'
import { isShareCrawler, shouldRewriteSharePreview } from './crawlers'

describe('share crawlers', () => {
  it('treats preview fetchers as crawlers and in-app browsers as people', () => {
    expect(isShareCrawler('WhatsApp/2.23.20.0')).toBe(true)
    expect(isShareCrawler('Twitterbot/1.0')).toBe(true)
    expect(isShareCrawler('facebookexternalhit/1.1')).toBe(true)
    expect(
      isShareCrawler(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/23.1.75',
      ),
    ).toBe(false)
    expect(isShareCrawler('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15E148 Safari/604.1')).toBe(
      false,
    )
    expect(shouldRewriteSharePreview('Twitterbot/1.0', '/agree/c/abc')).toBe(true)
    expect(shouldRewriteSharePreview('Twitterbot/1.0', '/agree')).toBe(false)
  })
})
