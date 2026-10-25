import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  absoluteShareUrl,
  fetchComparison,
  recordShare,
  rememberToken,
  submitFriendAnswers,
} from '../../lib/agree/client'
import {
  agreementHeadline,
  answerLabel,
  breakdown,
  closingLine,
  commonGround,
  crowdSentence,
  middleSentence,
  shareTitle,
  splits,
} from '../../lib/agree/present'
import { usePageTitle } from '../../lib/usePageTitle'
import type { Answer, ComparisonView } from '../../lib/agree/types'
import { MeetMark } from './MeetMark'
import { StatementWizard } from './StatementWizard'

export function ComparePage() {
  const { code = '' } = useParams()
  const [view, setView] = useState<ComparisonView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [ready, setReady] = useState(false)

  const title =
    view?.status === 'result'
      ? `${agreementHeadline(view.percent, view.youAre)} · We Almost Agree`
      : view?.status === 'invite' || view?.status === 'waiting'
        ? `${view.topic.title} · We Almost Agree`
        : 'Agreement Gap · We Almost Agree'
  usePageTitle(title)

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const statusRef = useRef(view?.status)
  statusRef.current = view?.status

  useEffect(() => {
    let cancelled = false
    const load = () => {
      fetchComparison(code)
        .then((next) => {
          if (!cancelled) {
            setView(next)
            setError(null)
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) setError(err instanceof Error ? err.message : 'That link could not be opened.')
        })
    }
    load()
    const timer = window.setInterval(() => {
      if (statusRef.current === 'waiting') load()
    }, 4000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [code])

  async function share(percent: number | null, topicTitle: string, path: string) {
    const url = absoluteShareUrl(path)
    const text = shareTitle(topicTitle, percent)
    try {
      await recordShare(code)
    } catch {
      // Sharing still works if the counter does not.
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: text, text, url })
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  if (error) {
    return (
      <div className="agree-stack">
        <h1>That link did not open</h1>
        <p className="agree-lede">{error}</p>
        <Link className="solid-btn" to="/agree">
          Pick a topic
        </Link>
      </div>
    )
  }

  if (!view) return <p className="agree-quiet">Opening the link…</p>

  if (view.status === 'expired') {
    return (
      <div className="agree-stack">
        <h1>This link has expired</h1>
        <p className="agree-lede">
          Links last 30 days, so {view.topic.title.toLowerCase()} needs a fresh start. Your old answers stay private.
        </p>
        <Link className="solid-btn" to="/agree">
          Start a new one
        </Link>
      </div>
    )
  }

  if (view.status === 'invite' && !ready) {
    return (
      <div className="agree-stack">
        <MeetMark percent={null} compact />
        <p className="agree-kicker">{view.topic.title}</p>
        <h1>Someone wants to see if you agree</h1>
        <p className="agree-lede">
          You’ll answer the same three statements. Their answers stay hidden until you’ve chosen yours. No login.
        </p>
        <button className="solid-btn" type="button" onClick={() => setReady(true)}>
          I’m ready
        </button>
      </div>
    )
  }

  if (view.status === 'invite') {
    return (
      <StatementWizard
        topic={view.topic}
        onComplete={async (answers) => {
          const result = await submitFriendAnswers(code, answers)
          rememberToken(code, 'friend', result.friendToken)
          setView(result.comparison)
        }}
      />
    )
  }

  if (view.status === 'waiting') {
    const url = absoluteShareUrl(view.sharePath)
    return (
      <div className="agree-stack">
        <MeetMark percent={null} compact />
        <p className="agree-kicker">{view.topic.title}</p>
        <h1>Send this to one person</h1>
        <p className="agree-lede">They answer the same three. Then you both see where you meet.</p>
        <p className="share-url">{url.replace(/^https?:\/\//, '')}</p>
        <div className="agree-actions">
          <button className="solid-btn" type="button" onClick={() => void share(null, view.topic.title, view.sharePath)}>
            {copied ? 'Link copied' : 'Send the link'}
          </button>
          <button
            className="quiet-btn"
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(url).then(() => setCopied(true)).catch(() => setCopied(false))
              void recordShare(code).catch(() => undefined)
            }}
          >
            Copy link
          </button>
        </div>
        <section className="panel">
          <h2>Your answers</h2>
          <ul className="answer-list">
            {view.topic.statements.map((statement, index) => (
              <li key={statement.id}>
                <span>{statement.text}</span>
                <strong>{answerLabel(view.yourAnswers[index])}</strong>
              </li>
            ))}
          </ul>
        </section>
        <p className="agree-quiet">Waiting for them. This page updates on its own.</p>
      </div>
    )
  }

  return <ResultView view={view} onShare={(percent, topicTitle, path) => share(percent, topicTitle, path)} copied={copied} />
}

function ResultView({
  view,
  onShare,
  copied,
}: {
  view: Extract<ComparisonView, { status: 'result' }>
  onShare: (percent: number, topicTitle: string, path: string) => Promise<void>
  copied: boolean
}) {
  const you: Answer[] = view.youAre === 'friend' ? view.friendAnswers : view.originAnswers
  const them: Answer[] = view.youAre === 'friend' ? view.originAnswers : view.friendAnswers
  const rows = breakdown(view.topic, you, them, view.youAre)
  const shared = commonGround(rows)
  const apart = splits(rows)
  const headline = agreementHeadline(view.percent, view.youAre)

  return (
    <div className="agree-stack">
      <MeetMark percent={view.percent} />
      <p className="agree-kicker">{view.topic.title}</p>
      <h1>{headline}</h1>
      <p className="agree-lede">Same answer is full agreement. Unsure against a firm answer is half. Opposites are the whole gap.</p>

      {shared.length ? (
        <section className="panel ground">
          <h2>Where you already meet</h2>
          <ul className="result-list">
            {shared.map((row) => (
              <li key={row.text}>
                <p>{row.text}</p>
                <p className="result-meta">
                  {row.summary} <span>{row.distance}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {apart.length ? (
        <section className="panel gap">
          <h2>Where there’s a gap</h2>
          <ul className="result-list">
            {apart.map((row) => (
              <li key={row.text}>
                <p>{row.text}</p>
                <p className="result-meta">
                  {row.summary} <span>{row.distance}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="closing">
        <h2>Start here</h2>
        <p>{closingLine(shared.length)}</p>
      </section>

      {view.crowd ? (
        <section className="panel">
          <h2>Everyone else</h2>
          <p className="agree-quiet">{view.crowd.responses} anonymous answers. No names.</p>
          <ul className="crowd-list">
            {view.topic.statements.map((statement, index) => {
              const stat = view.crowd!.statements[index]
              const yours = you[index]
              const share = yours === 1 ? stat.agree : yours === -1 ? stat.disagree : stat.unsure
              return (
                <li key={statement.id}>
                  <p>{statement.text}</p>
                  <div
                    className="crowd-bar"
                    role="img"
                    aria-label={`Agree ${stat.agree} percent, unsure ${stat.unsure} percent, disagree ${stat.disagree} percent`}
                  >
                    {stat.agree ? <span className="seg agree" style={{ width: `${stat.agree}%` }} /> : null}
                    {stat.unsure ? <span className="seg unsure" style={{ width: `${stat.unsure}%` }} /> : null}
                    {stat.disagree ? <span className="seg disagree" style={{ width: `${stat.disagree}%` }} /> : null}
                  </div>
                  <p className="result-meta">{crowdSentence(yours, share)}</p>
                </li>
              )
            })}
          </ul>
          {view.crowd.closerToMiddleThan !== null ? <p>{middleSentence(view.crowd.closerToMiddleThan)}</p> : null}
        </section>
      ) : (
        <p className="agree-quiet">A crowd view opens once 30 people have answered this topic. Totals only, never names.</p>
      )}

      <div className="agree-actions">
        <button className="solid-btn" type="button" onClick={() => void onShare(view.percent, view.topic.title, view.sharePath)}>
          {copied ? 'Link copied' : 'Share the result'}
        </button>
        <Link className="quiet-btn" to="/agree">
          Try a topic of your own
        </Link>
      </div>
    </div>
  )
}
