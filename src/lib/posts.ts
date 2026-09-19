export type BlogPost = {
  slug: string
  title: string
  date: string
  excerpt: string
  body: string
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function parseMarkdownPost(raw: string, filename: string): BlogPost {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    throw new Error(`Post ${filename} needs YAML frontmatter between --- fences.`)
  }

  const fields: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const idx = trimmed.indexOf(':')
    if (idx === -1) {
      throw new Error(`Post ${filename} has a frontmatter line without a colon: ${trimmed}`)
    }
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    fields[key] = value
  }

  const slug = filename.replace(/\.md$/, '').split('/').pop()
  if (!slug) {
    throw new Error(`Could not derive a slug from ${filename}`)
  }

  const title = fields.title
  const date = fields.date
  const excerpt = fields.excerpt
  if (!title || !date || !excerpt) {
    throw new Error(`Post ${filename} needs title, date, and excerpt in frontmatter.`)
  }
  if (!DATE_PATTERN.test(date)) {
    throw new Error(`Post ${filename} date must be YYYY-MM-DD.`)
  }

  return {
    slug,
    title,
    date,
    excerpt,
    body: match[2].trim(),
  }
}

const rawPosts = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  eager: true,
  import: 'default',
}) as Record<string, string>

export const BLOG_POSTS: BlogPost[] = Object.entries(rawPosts)
  .map(([filename, raw]) => parseMarkdownPost(raw, filename))
  .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))

export const BLOG_BY_SLUG = Object.fromEntries(
  BLOG_POSTS.map((post) => [post.slug, post]),
) as Record<string, BlogPost>

export function getPost(slug: string | undefined): BlogPost | null {
  if (!slug) return null
  return BLOG_BY_SLUG[slug] ?? null
}

export function formatPostDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
