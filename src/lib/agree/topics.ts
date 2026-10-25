import type { StoredTopic } from './types'

/**
 * Starter topics from the Agreement Gap concept (25 October 2026).
 * Production reads the database, so Andrew can add a topic with SQL
 * and set `approved` without a code change. This list seeds local
 * development and the initial migration.
 */
export const STARTER_TOPICS: StoredTopic[] = [
  {
    id: 'working-from-home',
    title: 'Working from home',
    blurb: 'Where the work happens, and who decides.',
    approved: true,
    sortOrder: 1,
    statements: [
      { id: 'working-from-home-1', text: 'Most office workers do their job as well at home.' },
      { id: 'working-from-home-2', text: 'Two office days a week is a fair balance.' },
      { id: 'working-from-home-3', text: 'Employers should decide where staff work.' },
    ],
  },
  {
    id: 'electric-cars',
    title: 'Electric cars',
    blurb: 'Practical today, and the UK timeline.',
    approved: true,
    sortOrder: 2,
    statements: [
      { id: 'electric-cars-1', text: 'EVs are practical for most UK drivers today.' },
      {
        id: 'electric-cars-2',
        text: 'The UK plan to end new petrol and diesel car sales in 2030, and hybrids in 2035, is realistic.',
      },
      { id: 'electric-cars-3', text: 'Public charging is good enough where I live.' },
    ],
  },
  {
    id: 'four-day-week',
    title: '4-day week',
    blurb: 'Fewer days, and whether the work still gets done.',
    approved: true,
    sortOrder: 3,
    statements: [
      { id: 'four-day-week-1', text: 'A 4-day week would work in my type of job.' },
      { id: 'four-day-week-2', text: 'Productivity would stay the same on four days.' },
      { id: 'four-day-week-3', text: 'It should be trialled more widely in the UK.' },
    ],
  },
  {
    id: 'phones-in-schools',
    title: 'Phones in schools',
    blurb: 'Bans, age, and who sets the rule.',
    approved: true,
    sortOrder: 4,
    statements: [
      { id: 'phones-in-schools-1', text: 'Phones should be banned during the school day.' },
      { id: 'phones-in-schools-2', text: 'Under-14s are better off without a smartphone.' },
      { id: 'phones-in-schools-3', text: 'Parents, not schools, should set phone rules.' },
    ],
  },
  {
    id: 'tipping',
    title: 'Tipping',
    blurb: 'Service charges, a fair percent, and pay.',
    approved: true,
    sortOrder: 5,
    statements: [
      { id: 'tipping-1', text: 'Service charges should be optional, not added by default.' },
      { id: 'tipping-2', text: '10–12.5% is a fair tip in restaurants.' },
      { id: 'tipping-3', text: 'Staff should be paid enough that tips are a bonus.' },
    ],
  },
  {
    id: 'cash-vs-card',
    title: 'Cash vs card',
    blurb: 'Notes and coins, and who gets left out.',
    approved: true,
    sortOrder: 6,
    statements: [
      { id: 'cash-vs-card-1', text: 'Shops should always accept cash.' },
      { id: 'cash-vs-card-2', text: 'I would be fine with a cashless UK.' },
      { id: 'cash-vs-card-3', text: 'Card-only places put some people at a disadvantage.' },
    ],
  },
]

export function approvedTopics(topics: StoredTopic[] = STARTER_TOPICS) {
  return topics
    .filter((topic) => topic.approved)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((topic) => ({
      id: topic.id,
      title: topic.title,
      blurb: topic.blurb,
      statements: topic.statements,
    }))
}
