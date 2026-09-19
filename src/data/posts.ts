import bitcoinBody from '../content/posts/bitcoin-worked-example.md?raw'
import evBody from '../content/posts/electric-cars-worked-example.md?raw'
import pitchBody from '../content/posts/what-we-almost-agree-is.md?raw'
import type { BlogPost } from '../types'

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'what-we-almost-agree-is',
    title: 'What We Almost Agree is',
    date: '2026-09-19',
    excerpt:
      'Make a statement, evaluate the overlap, name the avenues, and only later — if at all — reach a regulated broker. The master pitch, without the dunking.',
    topicLabel: 'Product',
    body: pitchBody,
  },
  {
    slug: 'electric-cars-worked-example',
    title: 'A worked example: “Electric cars are shit.”',
    date: '2026-09-18',
    excerpt:
      'A spicy transport slogan, split into shared premises and leftovers, then a Venn, then the industries behind doubling down — still not a buy tip.',
    topicLabel: 'Transport',
    relatedClaimId: 'electric-cars',
    relatedClaimLabel: 'Open the electric-car map',
    body: evBody,
  },
  {
    slug: 'bitcoin-worked-example',
    title: 'A worked example: “You should invest in Bitcoin.”',
    date: '2026-09-17',
    excerpt:
      'The same pattern on a money slogan: overlap first, contested leftovers, a landscape of avenues, and an FCA broker only as a later path.',
    topicLabel: 'Money',
    relatedClaimId: 'bitcoin',
    relatedClaimLabel: 'Open the Bitcoin map',
    body: bitcoinBody,
  },
]

export function formatPostDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function listPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => {
    if (a.date === b.date) return a.title.localeCompare(b.title, 'en-GB')
    return a.date < b.date ? 1 : -1
  })
}

export function getPostBySlug(slug: string | undefined): BlogPost | null {
  if (!slug) return null
  return BLOG_POSTS.find((post) => post.slug === slug) ?? null
}
