import { describe, expect, it } from 'vitest'
import { GET as polymarketGet } from './polymarket'
import { GET as quoteGet } from './quote'

describe('vercel web handlers', () => {
  it('rejects a quote request without symbols', async () => {
    const response = await quoteGet(new Request('https://wealmostagree.com/api/quote'))
    expect(response.status).toBe(400)
    const body = (await response.json()) as { error: string }
    expect(body.error).toMatch(/symbols/)
  })

  it('rejects a polymarket request without a statement', async () => {
    const response = await polymarketGet(new Request('https://wealmostagree.com/api/polymarket'))
    expect(response.status).toBe(400)
    const body = (await response.json()) as { error: string }
    expect(body.error).toMatch(/statement/)
  })
})
