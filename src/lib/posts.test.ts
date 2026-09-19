import { describe, expect, it } from 'vitest'
import { BLOG_POSTS, formatPostDate, getPost, parseMarkdownPost } from './posts'

const SAMPLE = `---
title: A sample note
date: 2026-09-19
excerpt: Short line for the index.
---

Hello **reader**. See the [EV map](/claim/electric-cars).
`

describe('parseMarkdownPost', () => {
  it('reads frontmatter and the body after the closing fence', () => {
    const post = parseMarkdownPost(SAMPLE, 'src/content/blog/a-sample-note.md')
    expect(post.slug).toBe('a-sample-note')
    expect(post.title).toBe('A sample note')
    expect(post.date).toBe('2026-09-19')
    expect(post.excerpt).toBe('Short line for the index.')
    expect(post.body).toContain('Hello **reader**.')
    expect(post.body.startsWith('---')).toBe(false)
  })

  it('rejects missing frontmatter and bad dates', () => {
    expect(() => parseMarkdownPost('# No fences\n', 'broken.md')).toThrow(/frontmatter/i)
    expect(() =>
      parseMarkdownPost(
        `---
title: x
date: 19/09/2026
excerpt: y
---

Body
`,
        'bad-date.md',
      ),
    ).toThrow(/YYYY-MM-DD/)
  })
})

describe('starter posts', () => {
  it('loads the three in-repo notes, newest first', () => {
    expect(BLOG_POSTS.map((post) => post.slug)).toEqual([
      'ev-worked-example',
      'bitcoin-claim-map',
      'what-we-almost-agree-is',
    ])
    expect(getPost('ev-worked-example')?.title).toMatch(/electric cars/i)
    expect(getPost('missing-slug')).toBeNull()
  })

  it('formats dates in British English', () => {
    expect(formatPostDate('2026-09-19')).toBe('19 September 2026')
  })
})
