import { Link } from 'react-router-dom'
import { formatPostDate, listPosts } from '../data/posts'
import { usePageTitle } from '../lib/usePageTitle'

export function BlogIndexPage() {
  usePageTitle('Blog · We Almost Agree')
  const posts = listPosts()

  return (
    <div className="wrap">
      <p className="eyebrow">Notes</p>
      <h1>Blog</h1>
      <p className="lede">
        Short essays on the product idea and a couple of worked examples. Same tone as the maps:
        warm, clear, British English. No dunking, and no buy tips.
      </p>

      <div className="blog-list">
        {posts.map((post) => (
          <Link key={post.slug} className="blog-card card" to={`/blog/${post.slug}`}>
            <div className="post-meta">
              <span className="pill">{post.topicLabel}</span>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            </div>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
