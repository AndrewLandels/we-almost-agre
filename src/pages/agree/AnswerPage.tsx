import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createComparison, fetchTopics, rememberToken } from '../../lib/agree/client'
import { usePageTitle } from '../../lib/usePageTitle'
import type { Topic } from '../../lib/agree/types'
import { StatementWizard } from './StatementWizard'

export function AnswerPage() {
  const { topicId = '' } = useParams()
  const navigate = useNavigate()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [error, setError] = useState<string | null>(null)
  usePageTitle(topic ? `${topic.title} · We Almost Agree` : 'Agreement Gap · We Almost Agree')

  useEffect(() => {
    let cancelled = false
    fetchTopics()
      .then((body) => {
        if (cancelled) return
        const found = body.topics.find((item) => item.id === topicId) ?? null
        setTopic(found)
        if (!found) setError('That topic is not on the list.')
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'The topic could not be loaded.')
      })
    return () => {
      cancelled = true
    }
  }, [topicId])

  return (
    <div className="agree-stack">
      {error ? (
        <>
          <h1>We could not open that topic</h1>
          <p className="agree-lede">{error}</p>
          <Link className="solid-btn" to="/agree">
            See the topics
          </Link>
        </>
      ) : topic === null ? (
        <p className="agree-quiet">Opening the topic…</p>
      ) : (
        <StatementWizard
          topic={topic}
          onComplete={async (answers) => {
            const created = await createComparison(topic.id, answers)
            rememberToken(created.code, 'owner', created.ownerToken)
            navigate(created.sharePath)
          }}
        />
      )}
    </div>
  )
}
