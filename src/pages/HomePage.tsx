import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { ClosestMatches } from '../components/ClosestMatches'
import { isMappable, mapExpression } from '../lib/markets/mapExpression'
import { saveExpression } from '../lib/storage'
import { usePageTitle } from '../lib/usePageTitle'
import type { ExpressionMapping } from '../lib/markets/types'

const EXAMPLES = [
  { id: 'recession', text: "We're heading for a recession" },
  { id: 'rates', text: 'Rates stay high into next year' },
  { id: 'houses', text: 'House prices fall from here' },
]

export function HomePage() {
  usePageTitle('We Almost Agree')
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mapping, setMapping] = useState<ExpressionMapping | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapping) return
    const node = resultsRef.current
    const heading = node?.querySelector('h2')
    if (!node || !heading) return
    const top = heading.getBoundingClientRect().top
    if (top < 72 || top > window.innerHeight * 0.35) {
      node.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    if (heading instanceof HTMLElement) heading.focus({ preventScroll: true })
  }, [mapping])

  function submitStatement(text: string) {
    setError(null)
    try {
      const next = mapExpression(text)
      saveExpression(next)
      setMapping(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that statement.')
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    submitStatement(draft)
  }

  function onStatementKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    if (isMappable(draft)) submitStatement(draft)
  }

  const composer = (
    <form className={mapping ? 'hero-card rematch' : 'hero-card home-card'} onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="statement">
        {mapping ? 'Edit the sentence' : 'Your statement'}
      </label>
      {mapping ? <p className="field-quiet">Edit the sentence</p> : null}
      <div className={mapping ? 'rematch-bar' : undefined}>
        <textarea
          id="statement"
          className="claim-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onStatementKeyDown}
          placeholder="Type a sentence"
          maxLength={400}
        />
        <div className={mapping ? undefined : 'home-actions'}>
          <button className="btn" type="submit" disabled={!isMappable(draft)}>
            Enter
          </button>
        </div>
      </div>
      {error ? <p className="alert">{error}</p> : null}
      <div className="statement-chips">
        {EXAMPLES.map((example) => (
          <button
            key={example.id}
            type="button"
            className="statement-chip"
            onClick={() => {
              setDraft(example.text)
              submitStatement(example.text)
            }}
          >
            {example.text}
          </button>
        ))}
      </div>
    </form>
  )

  return (
    <div className="wrap">
      {mapping ? (
        <div className="submitted-top" ref={resultsRef}>
          <h1 className="result-statement">“{mapping.original}”</h1>
          <ClosestMatches mapping={mapping} />
          {composer}
        </div>
      ) : (
        <section className="home-first">
          <h1 className="home-sentence">
            Type what you'd say to friends. See the closest live markets.
          </h1>
          {composer}
          <p className="home-note">Paper only. Not advice, and not a broker.</p>
        </section>
      )}
    </div>
  )
}
