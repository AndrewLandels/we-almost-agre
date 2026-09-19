import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="wrap error-page">
      <h1>That page is not on the map</h1>
      <p className="lede">Paste a gut statement from the home page, or go deeper into the maps.</p>
      <Link className="btn" to="/">
        Go home
      </Link>
    </div>
  )
}
