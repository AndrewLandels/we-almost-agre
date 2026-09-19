import type { Components } from 'react-markdown'
import Markdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatPostDate, getPost } from '../lib/posts'

const markdownComponents: Components = {
  a({ href, children }) {
    if (href?.startsWith('/')) {
      return <Link to={href}>{children}</Link>
    }
    return (
      <a href={href} rel="noreferrer">
        {children}
      </a>
    )
  },
}

export function BlogPostPage() {
  const { slug } = useParams()
  const post = getPost(slug)
  usePageTitle(post?.title)

  if (!post) {
    return (
      <div className="wrap error-page">
        <h1>That note is not on the map</h1>
        <p className="lede">It may have moved, or the link is a little optimistic.</p>
        <p>
          <Link className="btn" to="/blog">
            Back to the blog
          </Link>
        </p>
      </div>
    )
  }

  return (
    <article className="wrap blog-article">
      <p>
        <Link className="back-link" to="/blog">
          All notes
        </Link>
      </p>
      <p className="eyebrow">From the blog</p>
      <h1>{post.title}</h1>
      <time className="blog-date" dateTime={post.date}>
        {formatPostDate(post.date)}
      </time>
      <div className="blog-prose">
        <Markdown components={markdownComponents}>{post.body}</Markdown>
      </div>
    </article>
  )
}
