import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Markdown } from './markdown'

function render(source: string) {
  return renderToStaticMarkup(createElement(Markdown, { source }))
}

describe('Markdown', () => {
  it('renders headings, lists, emphasis, and safe links', () => {
    const html = render(
      [
        '## Title',
        '',
        'A **bold** and *italic* word, plus `code`.',
        '',
        '- One',
        '- Two',
        '',
        'See [the map](/claim/electric-cars) and [the site](https://wealmostagree.com).',
        '',
        '[bad](javascript:alert(1))',
      ].join('\n'),
    )

    expect(html).toContain('<h2>Title</h2>')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
    expect(html).toContain('<code>code</code>')
    expect(html).toContain('<ul>')
    expect(html).toContain('href="/claim/electric-cars"')
    expect(html).toContain('href="https://wealmostagree.com"')
    expect(html).toContain('rel="noreferrer"')
    expect(html).not.toContain('javascript:')
  })

  it('renders block quotes and numbered leftovers', () => {
    const html = render('> Electric cars are shit.\n\n1. First\n2. Second')
    expect(html).toContain('<blockquote')
    expect(html).toContain('Electric cars are shit.')
    expect(html).toContain('<ol>')
    expect(html).toContain('<li>First</li>')
  })
})
