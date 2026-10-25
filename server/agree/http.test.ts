import { describe, expect, it } from 'vitest'
import { handleAgreeRequest } from './http'
import { createMemoryRepo } from './memoryRepo'
import { handlePreviewRequest } from './preview'

describe('agree http', () => {
  it('round-trips a share link without leaking the first answers', async () => {
    const repo = createMemoryRepo()
    const createdResponse = await handleAgreeRequest(
      new Request('https://wealmostagree.com/api/agree?action=comparison', {
        method: 'POST',
        body: JSON.stringify({ topicId: 'electric-cars', answers: [1, 0, -1] }),
      }),
      repo,
    )
    expect(createdResponse.status).toBe(201)
    const created = (await createdResponse.json()) as { code: string; ownerToken: string }
    expect(created.code).toBeTruthy()

    const inviteResponse = await handleAgreeRequest(
      new Request(`https://wealmostagree.com/api/agree?action=comparison&code=${created.code}`),
      repo,
    )
    const invite = await inviteResponse.json()
    expect(invite.status).toBe('invite')
    expect(invite.topic.statements[1].text).toMatch(/2030/)
    expect(invite.topic.statements[1].text).toMatch(/2035/)
    expect(JSON.stringify(invite)).not.toContain('originAnswers')

    const answerResponse = await handleAgreeRequest(
      new Request(`https://wealmostagree.com/api/agree?action=answer&code=${created.code}`, {
        method: 'POST',
        body: JSON.stringify({ answers: [1, 1, -1] }),
      }),
      repo,
    )
    expect(answerResponse.status).toBe(200)
    const answered = (await answerResponse.json()) as { comparison: { percent: number; status: string } }
    expect(answered.comparison.status).toBe('result')
    expect(answered.comparison.percent).toBe(83)

    const preview = await handlePreviewRequest(
      new Request(`https://wealmostagree.com/api/agree-preview?code=${created.code}`),
      repo,
    )
    const html = await preview.text()
    expect(html).toContain('og:title')
    expect(html).toContain('We agree 83% on Electric cars')
    expect(html).toContain('noindex')
    expect(html).toContain('/api/agree-og')
  })

  it('rejects a half-finished answer', async () => {
    const response = await handleAgreeRequest(
      new Request('https://wealmostagree.com/api/agree?action=comparison', {
        method: 'POST',
        body: JSON.stringify({ topicId: 'tipping', answers: [1, 0] }),
      }),
      createMemoryRepo(),
    )
    expect(response.status).toBe(400)
  })
})

describe('agree open graph image', () => {
  it('renders a png card', async () => {
    const { GET: ogGet } = await import('../handlers/agreeOg')
    const response = await ogGet(
      new Request('https://wealmostagree.com/api/agree-og?mode=result&topic=Tipping&percent=78'),
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('image/png')
    const bytes = new Uint8Array(await response.arrayBuffer())
    expect(bytes[0]).toBe(0x89)
    expect(bytes[1]).toBe(0x50)
  })
})
