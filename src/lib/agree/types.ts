export type Answer = -1 | 0 | 1

export type Statement = {
  id: string
  text: string
}

export type Topic = {
  id: string
  title: string
  blurb: string
  statements: Statement[]
}

export type StoredTopic = Topic & {
  approved: boolean
  sortOrder: number
}

export type ViewerRole = 'origin' | 'friend' | 'either'

export type CrowdStatement = {
  agree: number
  unsure: number
  disagree: number
}

export type Crowd = {
  responses: number
  statements: CrowdStatement[]
  /** Share of responses that sit further from the middle than this viewer. */
  closerToMiddleThan: number | null
}

export type ComparisonView =
  | {
      status: 'expired'
      topic: Pick<Topic, 'id' | 'title'>
      expiresAt: string
    }
  | {
      status: 'invite'
      topic: Topic
      code: string
      expiresAt: string
    }
  | {
      status: 'waiting'
      topic: Topic
      code: string
      expiresAt: string
      yourAnswers: Answer[]
      sharePath: string
    }
  | {
      status: 'result'
      topic: Topic
      code: string
      expiresAt: string
      percent: number
      youAre: ViewerRole
      originAnswers: Answer[]
      friendAnswers: Answer[]
      sharePath: string
      crowd: Crowd | null
    }

export type CreateResult = {
  code: string
  ownerToken: string
  expiresAt: string
  sharePath: string
}

export type AnswerResult = {
  friendToken: string
  comparison: ComparisonView
}
