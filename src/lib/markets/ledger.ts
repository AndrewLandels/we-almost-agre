import { MIN_PAPER_SIZE, STARTING_PAPER_CASH } from './copy'
import type { ClosedPaperPosition, MarketQuote, PaperBook, PaperPosition, PaperSide } from './types'

export function defaultPaperBook(now = new Date()): PaperBook {
  return {
    cash: STARTING_PAPER_CASH,
    positions: [],
    closed: [],
    createdAt: now.toISOString(),
  }
}

export function unrealisedPnl(position: PaperPosition, mark: number): number {
  if (!Number.isFinite(mark) || mark <= 0 || position.entryPrice <= 0) return 0
  const move = mark / position.entryPrice - 1
  return position.side === 'long' ? position.notional * move : position.notional * -move
}

export function positionValue(position: PaperPosition, mark: number): number {
  return position.notional + unrealisedPnl(position, mark)
}

export function bookEquity(book: PaperBook, quotes: Record<string, MarketQuote | undefined>): number {
  const openValue = book.positions.reduce((sum, position) => {
    const mark = quotes[position.symbolId]?.price ?? position.entryPrice
    return sum + positionValue(position, mark)
  }, 0)
  return book.cash + openValue
}

export function openPaperPosition(
  book: PaperBook,
  input: {
    symbolId: string
    side: PaperSide
    notional: number
    entryPrice: number
    statementId?: string
    now?: Date
    id?: string
  },
): PaperBook {
  const notional = input.notional
  if (!Number.isFinite(notional) || notional < MIN_PAPER_SIZE) {
    throw new Error(`Minimum paper size is ${MIN_PAPER_SIZE} units.`)
  }
  if (!Number.isFinite(input.entryPrice) || input.entryPrice <= 0) {
    throw new Error('Need a usable mark before a paper position can be opened.')
  }
  if (notional > book.cash) {
    throw new Error('Not enough paper cash left in this book.')
  }

  const now = input.now ?? new Date()
  const position: PaperPosition = {
    id: input.id ?? `pos-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    symbolId: input.symbolId,
    side: input.side,
    notional,
    entryPrice: input.entryPrice,
    openedAt: now.toISOString(),
    statementId: input.statementId,
  }

  return {
    ...book,
    cash: book.cash - notional,
    positions: [...book.positions, position],
  }
}

export function closePaperPosition(
  book: PaperBook,
  positionId: string,
  exitPrice: number,
  now = new Date(),
): PaperBook {
  const position = book.positions.find((row) => row.id === positionId)
  if (!position) {
    throw new Error('That paper position is not open.')
  }
  if (!Number.isFinite(exitPrice) || exitPrice <= 0) {
    throw new Error('Need a usable mark before a paper position can be closed.')
  }

  const realisedPnl = unrealisedPnl(position, exitPrice)
  const closed: ClosedPaperPosition = {
    ...position,
    exitPrice,
    realisedPnl,
    closedAt: now.toISOString(),
  }

  return {
    ...book,
    cash: book.cash + position.notional + realisedPnl,
    positions: book.positions.filter((row) => row.id !== positionId),
    closed: [closed, ...book.closed],
  }
}

export function formatUnits(value: number, digits = 2): string {
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function formatSignedUnits(value: number): string {
  const formatted = formatUnits(Math.abs(value))
  if (value > 0.005) return `+${formatted}`
  if (value < -0.005) return `−${formatted}`
  return formatUnits(0)
}
