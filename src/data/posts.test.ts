import { describe, expect, it } from 'vitest'
import { BLOG_POSTS, formatPostDate, getPostBySlug, listPosts } from './posts'

describe('blog posts', () => {
  it('has unique slugs and ISO dates', () => {
    const slugs = BLOG_POSTS.map((post) => post.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const post of BLOG_POSTS) {
      expect(post.slug).toMatch(/^[a-z0-9-]+$/)
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(post.title.length).toBeGreaterThan(8)
      expect(post.excerpt.length).toBeGreaterThan(20)
      expect(post.body.length).toBeGreaterThan(200)
    }
  })

  it('lists newest first and finds a post by slug', () => {
    const listed = listPosts()
    expect(listed[0]?.slug).toBe('what-we-almost-agree-is')
    expect(listed.map((post) => post.slug)).toEqual([
      'what-we-almost-agree-is',
      'electric-cars-worked-example',
      'bitcoin-worked-example',
    ])
    expect(getPostBySlug('electric-cars-worked-example')?.topicLabel).toBe('Transport')
    expect(getPostBySlug('missing')).toBeNull()
  })

  it('formats dates in British English', () => {
    expect(formatPostDate('2026-09-19')).toBe('19 September 2026')
  })

  it('keeps the worked examples educational rather than promotional', () => {
    const bodies = BLOG_POSTS.map((post) => post.body.toLowerCase()).join('\n')
    expect(bodies).toMatch(/fca/)
    expect(bodies).toMatch(/paper trade/)
    expect(bodies).not.toMatch(/buy this|guaranteed return|hot tip/)
  })
})
