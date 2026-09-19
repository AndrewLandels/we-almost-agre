import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="wrap error-page">
      <h1>That page is not on the map</h1>
      <p className="lede">Try a seed claim, a blog note, or paste your own from the home page.</p>
      <Link className="btn" to="/">
        Go home
      </Link>
    </div>
  )
}
