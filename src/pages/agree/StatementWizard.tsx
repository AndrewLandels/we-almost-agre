import { useEffect, useRef, useState } from 'react'
import type { Answer, Topic } from '../../lib/agree/types'

const CHOICES: { value: Answer; label: string; hint: string; tone: 'agree' | 'unsure' | 'disagree' }[] = [
  { value: 1, label: 'Agree', hint: 'This fits', tone: 'agree' },
  { value: 0, label: 'Unsure', hint: 'Somewhere in the middle', tone: 'unsure' },
    { value: -1, label: 'Disagree', hint: 'Not for me', tone: 'disagree' },
]

export function StatementWizard({
  topic,
  onComplete,
}: {
  topic: Topic
  onComplete: (answers: Answer[]) => Promise<void>
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const busyRef = useRef(false)
  const statement = topic.statements[index]

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [index])

  async function choose(value: Answer) {
    if (busyRef.current) return
    const next = answers.slice()
    next[index] = value
    setAnswers(next)
    setError(null)
    if (index < topic.statements.length - 1) {
      setIndex(index + 1)
      return
    }
    busyRef.current = true
    setBusy(true)
    try {
      await onComplete(next)
    } catch (err) {
      busyRef.current = false
      setBusy(false)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="agree-stack">
      <p className="agree-kicker">{topic.title}</p>
      <p className="agree-progress" aria-live="polite">
        Statement {index + 1} of {topic.statements.length}
      </p>
      <div className="agree-dots" aria-hidden="true">
        {topic.statements.map((item, dot) => (
          <span key={item.id} className={dot === index ? 'on' : dot < index ? 'done' : ''} />
        ))}
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="agree-statement">
        {statement.text}
      </h1>
      <div className="choice-list" role="group" aria-label="Your answer">
        {CHOICES.map((choice) => (
          <button
            key={choice.value}
            type="button"
            className={`choice ${choice.tone}`}
            aria-pressed={answers[index] === choice.value}
            disabled={busy}
            onClick={() => void choose(choice.value)}
          >
            <span>{choice.label}</span>
            <small>{choice.hint}</small>
          </button>
        ))}
      </div>
      {error ? <p className="agree-alert">{error}</p> : null}
      <div className="agree-row">
        <button
          type="button"
          className="text-btn"
          onClick={() => setIndex((current) => Math.max(0, current - 1))}
          disabled={busy || index === 0}
        >
          Back
        </button>
        {busy ? <p className="agree-quiet">Saving your answers…</p> : null}
      </div>
    </div>
  )
}
