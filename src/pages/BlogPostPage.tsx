import { Link, useParams } from 'react-router-dom'
import { formatPostDate, getPostBySlug } from '../data/posts'
import { Markdown } from '../lib/markdown'
import { usePageTitle } from '../lib/usePageTitle'

export function BlogPostPage() {
  const { slug } = useParams()
  const post = getPostBySlug(slug)

  usePageTitle(post ? `${post.title} · We Almost Agree` : 'Blog · We Almost Agree')

  if (!post) {
    return (
      <div className="wrap error-page">
        <h1>We could not find that post</h1>
        <p className="lede">The blog lives in the repo. If the slug is wrong, it will not be here.</p>
        <p>
          <Link className="btn" to="/blog">
            Back to the blog
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="wrap post-page">
      <p>
        <Link className="back-link" to="/blog">
          ← All posts
        </Link>
      </p>
      <div className="post-meta">
        <span className="pill">{post.topicLabel}</span>
        <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      </div>
      <h1>{post.title}</h1>
      <Markdown source={post.body} />
      {post.relatedClaimId ? (
        <p className="post-cta">
          <Link className="btn sage" to={`/claim/${post.relatedClaimId}`}>
            {post.relatedClaimLabel ?? 'Open the related map'}
          </Link>
        </p>
      ) : (
        <p className="post-cta">
          <Link className="btn sage" to="/">
            Try a claim on the home page
          </Link>
        </p>
      )}
    </div>
  )
}
