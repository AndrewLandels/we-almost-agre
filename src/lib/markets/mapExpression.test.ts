import { describe, expect, it } from 'vitest'
import { getSymbol, listUniverse } from '../../data/universe'
import { instrumentFactsCopy } from './instrumentFacts'
import { bannedLanguageHits } from './language'
import { cannedMapping, mapExpression, mappingCopyBundle } from './mapExpression'

describe('mapExpression', () => {
  it('maps the flagship US-economy sentence to SPY and related proxies', () => {
    const result = mapExpression('The US economy is going down the toilet.')
    expect(result.id).toBe('us-economy-down')
    expect(result.firstPass).toBe(true)
    expect(result.suggestions.map((row) => row.symbolId)).toEqual(['SPY', 'QQQ', 'IWM', 'CPER'])
    expect(result.sharedPremise.toLowerCase()).toMatch(/jobs|prices|stability/)
    expect(result.contestedExpression.toLowerCase()).toMatch(/s&p 500/)
  })

  it('keeps the paper path first when a seed claim matches, with a go-deeper link', () => {
    const ev = mapExpression('Electric cars are shit.')
    expect(ev.relatedClaimId).toBe('electric-cars')
    expect(ev.suggestions[0]?.symbolId).toBe('TSLA')

    const btc = mapExpression('You should invest in Bitcoin.')
    expect(btc.relatedClaimId).toBe('bitcoin')
    expect(btc.suggestions[0]?.symbolId).toBe('IBIT')

    const speech = mapExpression("America doesn't have freedom of speech.")
    expect(speech.relatedClaimId).toBe('us-speech')
    expect(speech.suggestions).toHaveLength(0)
  })

  it('can suggest theme symbols for EV-ish and Bitcoin-ish wording', () => {
    expect(mapExpression('EVs are a bubble and Tesla is finished.').suggestions[0]?.symbolId).toBe(
      'TSLA',
    )
    expect(mapExpression('Bitcoin is going to the moon this cycle.').suggestions[0]?.symbolId).toBe(
      'IBIT',
    )
  })

  it('labels unmatched text as a first-pass heuristic', () => {
    const result = mapExpression('Schools should ban phones entirely.')
    expect(result.source).toBe('heuristic')
    expect(result.firstPass).toBe(true)
    expect(result.framing.toLowerCase()).toMatch(/first-pass/)
  })

  it('rejects tiny input', () => {
    expect(() => mapExpression('Nope')).toThrow(/few words/i)
  })
})

describe('educational language', () => {
  it('keeps mapping and instrument copy free of advice wording', () => {
    const samples = [
      mapExpression('The US economy is going down the toilet.'),
      mapExpression('Electric cars are shit.'),
      mapExpression('You should invest in Bitcoin.'),
      mapExpression('Gold is the only safe asset left.'),
      cannedMapping('us-economy-down')!,
    ]

    const bundle = [
      ...samples.flatMap(mappingCopyBundle),
      ...instrumentFactsCopy(),
    ]

    for (const text of bundle) {
      expect(bannedLanguageHits(text), text).toEqual([])
    }
  })
})

describe('starter universe', () => {
  it('covers major indices, liquid shares, and commodity proxies', () => {
    expect(listUniverse('index').map((item) => item.id)).toEqual(
      expect.arrayContaining(['SPY', 'QQQ', 'IWM']),
    )
    expect(listUniverse('stock').length).toBeGreaterThanOrEqual(8)
    expect(listUniverse('commodity').map((item) => item.id)).toEqual(
      expect.arrayContaining(['GLD', 'USO', 'CPER']),
    )
    expect(getSymbol('SPY')?.vehicleNote.toLowerCase()).toMatch(/proxy/)
    expect(getSymbol('GLD')?.vehicleNote.toLowerCase()).toMatch(/etf/)
  })
})
