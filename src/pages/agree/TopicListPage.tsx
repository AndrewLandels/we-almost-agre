import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTopics } from '../../lib/agree/client'
import { usePageTitle } from '../../lib/usePageTitle'
import type { Topic } from '../../lib/agree/types'
import { MeetMark } from './MeetMark'

export function TopicListPage() {
  usePageTitle('Agreement Gap · We Almost Agree')
  const [topics, setTopics] = useState<Topic[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchTopics()
      .then((body) => {
        if (!cancelled) setTopics(body.topics)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'The topics could not be loaded.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="agree-stack">
      <MeetMark percent={null} compact />
      <p className="agree-kicker">Agreement Gap</p>
      <h1>How much do you already agree?</h1>
      <p className="agree-lede">
        Pick a topic. Answer three short statements. Send the link to one person, and see the gap — then the
        common ground.
      </p>
      {error ? (
        <p className="agree-alert">{error}</p>
      ) : topics === null ? (
        <p className="agree-quiet">Fetching topics…</p>
      ) : (
        <ul className="topic-list">
          {topics.map((topic) => (
            <li key={topic.id}>
              <Link className="topic-card" to={`/agree/t/${topic.id}`}>
                <span className="topic-title">{topic.title}</span>
                <span className="topic-blurb">{topic.blurb}</span>
                <span className="topic-meta">Three statements · about a minute</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
