import { SEED_CLAIMS } from '../data/seeds'
import type { ClaimAnalysis, ContestedClaim, SharedPremise } from '../types'
import { customClaimId } from './slug'

type TopicHint = {
  id: string
  label: string
  keywords: string[]
}

const TOPIC_HINTS: TopicHint[] = [
  {
    id: 'climate',
    label: 'Climate',
    keywords: ['climate', 'carbon', 'net zero', 'warming', 'emissions', 'fossil'],
  },
  {
    id: 'health',
    label: 'Health',
    keywords: ['vaccine', 'health', 'nhs', 'diet', 'mental', 'covid', 'medical'],
  },
  {
    id: 'money',
    label: 'Money',
    keywords: ['invest', 'tax', 'housing', 'rent', 'wage', 'inflation', 'bank', 'stock'],
  },
  {
    id: 'tech',
    label: 'Technology',
    keywords: ['ai', 'algorithm', 'phone', 'internet', 'social media', 'tech'],
  },
  {
    id: 'education',
    label: 'Education',
    keywords: ['school', 'university', 'student', 'exam', 'teacher'],
  },
  {
    id: 'politics',
    label: 'Politics',
    keywords: ['government', 'election', 'democracy', 'minister', 'parliament', 'president'],
  },
]

const SEED_ALIASES: { id: string; needles: string[] }[] = [
  {
    id: 'electric-cars',
    needles: [
      'electric cars are shit',
      'electric cars are crap',
      'evs are shit',
      'electric vehicles are shit',
      'electric cars are terrible',
    ],
  },
  {
    id: 'bitcoin',
    needles: [
      'you should invest in bitcoin',
      'everyone should buy bitcoin',
      'invest in bitcoin',
      'you should buy bitcoin',
    ],
  },
  {
    id: 'us-speech',
    needles: [
      "america doesn't have freedom of speech",
      'america does not have freedom of speech',
      'the us does not have free speech',
      "america doesn't have free speech",
      'america has no freedom of speech',
    ],
  },
]

function normalise(text: string): string {
  return text.toLowerCase().replace(/['’]/g, "'").replace(/\s+/g, ' ').trim()
}

function splitClauses(text: string): string[] {
  return text
    .split(/[.!?;]+|\band\b|\bbut\b|\bbecause\b/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 8)
}

function guessTopic(text: string): TopicHint | null {
  const haystack = normalise(text)
  let best: { topic: TopicHint; score: number; index: number } | null = null
  for (const topic of TOPIC_HINTS) {
    const hits = topic.keywords.filter((keyword) => haystack.includes(keyword))
    if (!hits.length) continue
    const score = hits.length
    const index = Math.min(...hits.map((keyword) => haystack.indexOf(keyword)))
    if (!best || score > best.score || (score === best.score && index < best.index)) {
      best = { topic, score, index }
    }
  }
  return best?.topic ?? null
}

function looksPrescriptive(text: string): boolean {
  return /\b(should|must|need to|ought|have to)\b/i.test(text)
}

function looksInsult(text: string): boolean {
  return /\b(shit|crap|awful|terrible|stupid|idiot|garbage|rubbish|sucks)\b/i.test(text)
}

function looksAbsolute(text: string): boolean {
  return /\b(always|never|everyone|no one|nobody|all|none|don't have|does not have|doesn't have)\b/i.test(
    text,
  )
}

function sharedPremisesFor(text: string, topic: TopicHint | null): SharedPremise[] {
  const premises: SharedPremise[] = [
    {
      id: 'demo-share-meaning',
      text: 'The original wording is doing more than one job — a value, a fact, and often a bit of identity. Those can be separated before anyone has to pick a side.',
    },
    {
      id: 'demo-share-people',
      text: 'Most people in the argument want a decent outcome, not a humiliation ritual. The heat is usually about the leftover gap, not the whole sentence.',
    },
  ]

  if (topic) {
    premises.push({
      id: `demo-share-${topic.id}`,
      text: `This sits in ${topic.label.toLowerCase()}, where the practical stakes (who is affected, what would count as evidence) are easier to share than the punchline.`,
    })
  } else if (looksPrescriptive(text)) {
    premises.push({
      id: 'demo-share-should',
      text: '“Should” hides a goal. People can share the goal — safety, fairness, prosperity — and still disagree about the recommended move.',
    })
  } else {
    premises.push({
      id: 'demo-share-tradeoff',
      text: 'Almost every public claim smuggles a trade-off: cost versus benefit, risk versus freedom, now versus later. Naming the trade-off is shared work.',
    })
  }

  return premises
}

function contestedFrom(text: string, topic: TopicHint | null): ContestedClaim[] {
  const clauses = splitClauses(text)
  const head = text.trim().replace(/[.?!]+$/, '')
  const firstClause = clauses[0] ?? head

  const claims: ContestedClaim[] = [
    {
      id: 'demo-core',
      text: `The core punchline is broadly true as stated: “${head}”.`,
      demoResolution: 'open',
      demoResolutionNote:
        'Custom maps stay open in v1. A later model pass can attach a lean; this first-pass split will not pretend to settle it.',
      evidence: [
        {
          stance: 'supports',
          blurb:
            'If you take the sentence in the spirit it was posted, plenty of lived examples will look like confirmation. That is why it spreads.',
        },
        {
          stance: 'challenges',
          blurb:
            'Blanket wording usually fails at the edges — different places, incomes, timelines, or definitions of the key words.',
        },
        {
          stance: 'context',
          blurb:
            'This evidence trail is a placeholder for a later research pass. Treat it as a map of what would need checking, not a verdict.',
        },
      ],
    },
  ]

  if (looksPrescriptive(text)) {
    claims.push({
      id: 'demo-should',
      text: `A typical person in the implied audience ought to act on this advice now.`,
      demoResolution: 'open',
      demoResolutionNote: 'Open — “should” claims need a specified audience and a cost of being wrong.',
      evidence: [
        {
          stance: 'supports',
          blurb:
            'If the downside of waiting is large and the advice is cheap to try, a general “should” can be fair.',
        },
        {
          stance: 'challenges',
          blurb:
            'Advice that ignores budget, risk tolerance, or local rules stops being advice and becomes a loyalty test.',
        },
        {
          stance: 'context',
          blurb: 'Ask “should — compared with what, for whom, by when?” and the claim usually shrinks.',
        },
      ],
    })
  } else if (looksInsult(text)) {
    claims.push({
      id: 'demo-quality',
      text: `The thing being insulted is worse than the ordinary alternative on the measures people actually care about.`,
      demoResolution: 'open',
      demoResolutionNote: 'Open — insults compress many measures into one word. Split the measures and the fight often halves.',
      evidence: [
        {
          stance: 'supports',
          blurb:
            'If reliability, cost, or dignity is routinely worse than the familiar option, the rude summary is pointing at something real.',
        },
        {
          stance: 'challenges',
          blurb:
            'A single rude adjective rarely survives contact with “for whom?” and “by which metric?”.',
        },
        {
          stance: 'context',
          blurb: 'Keep the feeling (frustration) and test the ranking (worse than what?).',
        },
      ],
    })
  } else if (looksAbsolute(text)) {
    claims.push({
      id: 'demo-absolute',
      text: `The absolute wording (“always”, “never”, “no one”, “doesn’t have”) holds once you look at the exceptions.`,
      demoResolution: 'open',
      demoResolutionNote: 'Open — absolutes are where first-pass maps earn their keep.',
      evidence: [
        {
          stance: 'supports',
          blurb: 'If the exceptions are rare or theatrical, the absolute is doing honest shorthand.',
        },
        {
          stance: 'challenges',
          blurb: 'One well-known exception is often enough to turn the slogan into a narrower, more useful claim.',
        },
        {
          stance: 'context',
          blurb: `Starting clause worth testing: “${firstClause}”.`,
        },
      ],
    })
  } else {
    claims.push({
      id: 'demo-general',
      text: `The claim generalises beyond the cases the speaker has in mind.`,
      demoResolution: 'open',
      demoResolutionNote: 'Open — generalisation is the usual leftover once tone is set aside.',
      evidence: [
        {
          stance: 'supports',
          blurb: 'If the same pattern shows up across groups and years, a general claim may be fair.',
        },
        {
          stance: 'challenges',
          blurb: 'A vivid example is not a rate. Many public fights die when someone asks for the denominator.',
        },
        {
          stance: 'context',
          blurb: 'A later analysis pass should attach sources to this node only — not to the shared premises.',
        },
      ],
    })
  }

  if (topic) {
    claims.push({
      id: `demo-topic-${topic.id}`,
      text: `On the ${topic.label.toLowerCase()} details that would actually change someone’s mind, the original statement is already specific enough to act on.`,
      demoResolution: 'open',
      demoResolutionNote: 'Open — topic detail is where a later LLM or editor pass should spend its tokens.',
      evidence: [
        {
          stance: 'supports',
          blurb: `If readers share a definition of the ${topic.label.toLowerCase()} terms, the sentence may already be precise enough.`,
        },
        {
          stance: 'challenges',
          blurb:
            'Most pasted claims skip mechanism, timeframe, and who pays. Those are usually the contested remainder.',
        },
        {
          stance: 'context',
          blurb:
            'This node exists so a future model can slot research in without restating the whole argument.',
        },
      ],
    })
  }

  return claims
}

export function matchSeedClaim(text: string): ClaimAnalysis | null {
  const haystack = normalise(text)
  if (!haystack) return null

  const alias = SEED_ALIASES.find((entry) =>
    entry.needles.some((needle) => haystack.includes(needle) || needle.includes(haystack)),
  )
  if (alias) {
    return SEED_CLAIMS.find((claim) => claim.id === alias.id) ?? null
  }

  return (
    SEED_CLAIMS.find((claim) => {
      const original = normalise(claim.original)
      return haystack === original || haystack.includes(original) || original.includes(haystack)
    }) ?? null
  )
}

/**
 * Split a free-text claim into shared premises vs contested nodes.
 * v1 is a labelled heuristic so the product loop works without an API key.
 * The return shape is the contract a later LLM analyser should fill.
 */
export function analyzeClaim(text: string): ClaimAnalysis {
  const trimmed = text.trim()
  if (trimmed.length < 8) {
    throw new Error('Please paste a claim of at least a few words.')
  }

  const seed = matchSeedClaim(trimmed)
  if (seed) return seed

  const topic = guessTopic(trimmed)
  const sharedPremises = sharedPremisesFor(trimmed, topic)
  const contestedClaims = contestedFrom(trimmed, topic)
  const overlapScore = Math.max(
    42,
    78 - contestedClaims.length * 6 - (looksInsult(trimmed) ? 8 : 0),
  )

  return {
    id: customClaimId(trimmed),
    original: trimmed,
    source: 'demo',
    topicLabel: topic?.label ?? 'General',
    overlapScore,
    overlapNote:
      'First-pass split only. We have tried to keep the human bit (what a reasonable person can already share) and leave the punchline as something you could actually test. A later model can deepen this without changing the shape of the page.',
    sharedPremises,
    contestedClaims,
  }
}

export function isAnalyzable(text: string): boolean {
  return text.trim().length >= 8
}
