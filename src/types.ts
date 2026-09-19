export type EvidenceStance = 'supports' | 'challenges' | 'context'

export type EvidenceNote = {
  stance: EvidenceStance
  blurb: string
  sourceLabel?: string
}

export type SharedPremise = {
  id: string
  text: string
}

export type DemoResolution = 'for' | 'against' | 'open'

export type ContestedClaim = {
  id: string
  text: string
  evidence: EvidenceNote[]
  demoResolution: DemoResolution
  demoResolutionNote: string
}

export type AnalysisSource = 'seed' | 'demo'

export type ClaimAnalysis = {
  id: string
  original: string
  source: AnalysisSource
  sharedPremises: SharedPremise[]
  contestedClaims: ContestedClaim[]
  overlapScore: number
  overlapNote: string
  topicLabel: string
}

export type StakeSide = 'for' | 'against'

export type OpenStake = {
  contestedId: string
  claimId: string
  side: StakeSide
  amount: number
  placedAt: string
}

export type SettledStake = OpenStake & {
  resolvedAs: Exclude<DemoResolution, 'open'>
  payout: number
  won: boolean
  settledAt: string
}

export type Wallet = {
  nickname: string
  balance: number
  openStakes: OpenStake[]
  settledStakes: SettledStake[]
}

export type LeaderboardRow = {
  id: string
  nickname: string
  points: number
  settled: number
  wins: number
  sample?: boolean
}

export type BlogPost = {
  slug: string
  title: string
  date: string
  excerpt: string
  body: string
  topicLabel: string
  relatedClaimId?: string
  relatedClaimLabel?: string
}
