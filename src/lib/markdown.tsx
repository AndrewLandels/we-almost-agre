import type { ReactNode } from 'react'

function safeHref(raw: string): string | null {
  const href = raw.trim()
  if (href.startsWith('/') && !href.startsWith('//')) return href
  if (href.startsWith('https://') || href.startsWith('http://')) return href
  return null
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let lastIndex = 0
  let key = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*')) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>)
    } else if (token.startsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>)
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      const href = link ? safeHref(link[2]) : null
      if (link && href) {
        const external = href.startsWith('http')
        nodes.push(
          <a
            key={key}
            href={href}
            {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {link[1]}
          </a>,
        )
      } else {
        nodes.push(link ? link[1] : token)
      }
    }

    key += 1
    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

function headingLevel(line: string): 1 | 2 | 3 | null {
  if (line.startsWith('### ')) return 3
  if (line.startsWith('## ')) return 2
  if (line.startsWith('# ')) return 1
  return null
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, '\n').trim().split(/\n{2,}/)
  const elements: ReactNode[] = []

  blocks.forEach((block, index) => {
    const lines = block.split('\n')
    const level = headingLevel(lines[0] ?? '')

    if (level && lines.length === 1) {
      const text = lines[0].replace(/^#{1,3}\s+/, '')
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
      elements.push(<Tag key={index}>{renderInline(text)}</Tag>)
      return
    }

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      elements.push(
        <ul key={index}>
          {lines.map((line, itemIndex) => (
            <li key={itemIndex}>{renderInline(line.replace(/^[-*]\s+/, ''))}</li>
          ))}
        </ul>,
      )
      return
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      elements.push(
        <ol key={index}>
          {lines.map((line, itemIndex) => (
            <li key={itemIndex}>{renderInline(line.replace(/^\d+\.\s+/, ''))}</li>
          ))}
        </ol>,
      )
      return
    }

    if (lines.every((line) => line.startsWith('> '))) {
      elements.push(
        <blockquote key={index} className="quote">
          {renderInline(lines.map((line) => line.slice(2)).join(' '))}
        </blockquote>,
      )
      return
    }

    elements.push(
      <p key={index}>
        {renderInline(lines.join(' '))}
      </p>,
    )
  })

  return <div className="post-prose">{elements}</div>
}
