import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { BLOG_POSTS, formatPostDate } from '../lib/posts'

export function BlogPage() {
  usePageTitle('Blog')

  return (
    <div className="wrap">
      <p className="eyebrow">Notes from the maps</p>
      <h1>Blog</h1>
      <p className="lede">
        Short write-ups of how a claim splits — shared ground, leftover, and the industries worth
        reading around if you still want to lean in. Educational themes only. Not tips.
      </p>

      <div className="blog-list">
        {BLOG_POSTS.map((post) => (
          <Link key={post.slug} className="blog-card seed-card" to={`/blog/${post.slug}`}>
            <time className="blog-date" dateTime={post.date}>
              {formatPostDate(post.date)}
            </time>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <span className="blog-more">Read this note</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
