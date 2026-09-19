import { STARTING_BALANCE } from '../data/seeds'
import { defaultPaperBook } from './markets/ledger'
import type { ExpressionMapping, PaperBook } from './markets/types'
import type { ClaimAnalysis, LeaderboardRow, Wallet } from '../types'

const WALLET_KEY = 'waa.wallet.v1'
const BOARD_KEY = 'waa.leaderboard.v1'
const CUSTOM_KEY = 'waa.customClaims.v1'
const BOOK_KEY = 'waa.paperBook.v1'
const EXPRESS_KEY = 'waa.expressions.v1'

function randomGuestName(): string {
  const n = Math.floor(100 + Math.random() * 900)
  return `Guest ${n}`
}

export function defaultWallet(): Wallet {
  return {
    nickname: randomGuestName(),
    balance: STARTING_BALANCE,
    openStakes: [],
    settledStakes: [],
  }
}

export function loadWallet(): Wallet {
  if (typeof window === 'undefined') return defaultWallet()
  try {
    const raw = window.localStorage.getItem(WALLET_KEY)
    if (!raw) {
      const fresh = defaultWallet()
      saveWallet(fresh)
      return fresh
    }
    const parsed = JSON.parse(raw) as Wallet
    if (typeof parsed.balance !== 'number' || !parsed.nickname) {
      return defaultWallet()
    }
    return {
      ...defaultWallet(),
      ...parsed,
      openStakes: parsed.openStakes ?? [],
      settledStakes: parsed.settledStakes ?? [],
    }
  } catch {
    return defaultWallet()
  }
}

export function saveWallet(wallet: Wallet): void {
  window.localStorage.setItem(WALLET_KEY, JSON.stringify(wallet))
}

const SAMPLE_BOARD: LeaderboardRow[] = [
  { id: 'sample-aisha', nickname: 'Aisha K.', points: 1420, settled: 6, wins: 4, sample: true },
  { id: 'sample-tom', nickname: 'Tom R.', points: 1185, settled: 5, wins: 3, sample: true },
  { id: 'sample-priya', nickname: 'Priya S.', points: 990, settled: 4, wins: 2, sample: true },
  { id: 'sample-owen', nickname: 'Owen P.', points: 860, settled: 3, wins: 1, sample: true },
]

export function loadLeaderboard(): LeaderboardRow[] {
  if (typeof window === 'undefined') return SAMPLE_BOARD
  try {
    const raw = window.localStorage.getItem(BOARD_KEY)
    if (!raw) {
      saveLeaderboard(SAMPLE_BOARD)
      return SAMPLE_BOARD
    }
    const parsed = JSON.parse(raw) as LeaderboardRow[]
    return Array.isArray(parsed) ? parsed : SAMPLE_BOARD
  } catch {
    return SAMPLE_BOARD
  }
}

export function saveLeaderboard(rows: LeaderboardRow[]): void {
  window.localStorage.setItem(BOARD_KEY, JSON.stringify(rows))
}

export function upsertPlayerRow(wallet: Wallet): LeaderboardRow[] {
  const rows = loadLeaderboard().filter((row) => row.id !== 'you')
  const you: LeaderboardRow = {
    id: 'you',
    nickname: wallet.nickname,
    points: wallet.balance,
    settled: wallet.settledStakes.length,
    wins: wallet.settledStakes.filter((stake) => stake.won).length,
  }
  const next = [...rows, you].sort((a, b) => b.points - a.points)
  saveLeaderboard(next)
  return next
}

export function saveCustomClaim(analysis: ClaimAnalysis): void {
  const all = loadCustomClaims()
  all[analysis.id] = analysis
  window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(all))
}

export function loadCustomClaims(): Record<string, ClaimAnalysis> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(CUSTOM_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, ClaimAnalysis>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function loadPaperBook(): PaperBook {
  if (typeof window === 'undefined') return defaultPaperBook()
  try {
    const raw = window.localStorage.getItem(BOOK_KEY)
    if (!raw) {
      const fresh = defaultPaperBook()
      savePaperBook(fresh)
      return fresh
    }
    const parsed = JSON.parse(raw) as PaperBook
    if (typeof parsed.cash !== 'number' || !Array.isArray(parsed.positions)) {
      return defaultPaperBook()
    }
    return {
      ...defaultPaperBook(),
      ...parsed,
      positions: parsed.positions ?? [],
      closed: parsed.closed ?? [],
    }
  } catch {
    return defaultPaperBook()
  }
}

export function savePaperBook(book: PaperBook): void {
  window.localStorage.setItem(BOOK_KEY, JSON.stringify(book))
}

export function resetPaperBook(): PaperBook {
  const fresh = defaultPaperBook()
  savePaperBook(fresh)
  return fresh
}

export function saveExpression(mapping: ExpressionMapping): void {
  const all = loadExpressions()
  all[mapping.id] = mapping
  window.localStorage.setItem(EXPRESS_KEY, JSON.stringify(all))
}

export function loadExpressions(): Record<string, ExpressionMapping> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(EXPRESS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, ExpressionMapping>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function resetLocalSeason(): Wallet {
  const current = loadWallet()
  const fresh: Wallet = {
    ...defaultWallet(),
    nickname: current.nickname,
  }
  saveWallet(fresh)
  const board = loadLeaderboard().filter((row) => row.sample)
  saveLeaderboard(board)
  upsertPlayerRow(fresh)
  return fresh
}
