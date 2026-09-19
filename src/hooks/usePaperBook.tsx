import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { bookEquity, closePaperPosition, openPaperPosition } from '../lib/markets/ledger'
import { fetchQuotes, loadCachedQuotes, quotesById } from '../lib/markets/prices'
import type { MarketQuote, PaperBook, PaperSide } from '../lib/markets/types'
import { loadPaperBook, resetPaperBook, savePaperBook } from '../lib/storage'

type FeedStatus = 'idle' | 'loading' | 'live-delayed' | 'fallback'

type PaperBookContextValue = {
  book: PaperBook
  quotes: Record<string, MarketQuote>
  status: FeedStatus
  fallbackUsed: boolean
  equity: number
  watch: string[]
  watchSymbols: (symbolIds: string[]) => void
  refresh: (symbolIds?: string[]) => Promise<void>
  openPosition: (input: {
    symbolId: string
    side: PaperSide
    notional: number
    statementId?: string
  }) => void
  closePosition: (positionId: string) => void
  resetBook: () => void
}

const PaperBookContext = createContext<PaperBookContextValue | null>(null)

export function PaperBookProvider({ children }: { children: ReactNode }) {
  const [book, setBook] = useState<PaperBook>(() => loadPaperBook())
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>(() => loadCachedQuotes())
  const [status, setStatus] = useState<FeedStatus>('idle')
  const [fallbackUsed, setFallbackUsed] = useState(false)
  const [watch, setWatch] = useState<string[]>([])

  const commit = useCallback((next: PaperBook) => {
    savePaperBook(next)
    setBook(next)
  }, [])

  const refresh = useCallback(async (symbolIds?: string[]) => {
    const ids = [
      ...new Set(
        [
          ...book.positions.map((position) => position.symbolId),
          ...book.closed.slice(0, 8).map((position) => position.symbolId),
          ...watch,
          ...(symbolIds ?? []),
        ].map((id) => id.toUpperCase()),
      ),
    ]
    if (!ids.length) return

    setStatus('loading')
    const payload = await fetchQuotes(ids)
    setQuotes((current) => ({ ...current, ...quotesById(payload.quotes) }))
    setFallbackUsed(payload.fallbackUsed)
    setStatus(payload.fallbackUsed ? 'fallback' : 'live-delayed')
  }, [book.closed, book.positions, watch])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const watchSymbols = useCallback((symbolIds: string[]) => {
    setWatch((current) => {
      const next = [...new Set([...current, ...symbolIds.map((id) => id.toUpperCase())])]
      const same = next.length === current.length && next.every((id) => current.includes(id))
      return same ? current : next
    })
  }, [])

  const openPosition = useCallback(
    (input: { symbolId: string; side: PaperSide; notional: number; statementId?: string }) => {
      const quote = quotes[input.symbolId]
      if (!quote) {
        throw new Error('Need a mark for that symbol before a paper position can be opened.')
      }
      commit(
        openPaperPosition(book, {
          symbolId: input.symbolId,
          side: input.side,
          notional: input.notional,
          entryPrice: quote.price,
          statementId: input.statementId,
        }),
      )
    },
    [book, commit, quotes],
  )

  const closePosition = useCallback(
    (positionId: string) => {
      const position = book.positions.find((row) => row.id === positionId)
      if (!position) {
        throw new Error('That paper position is not open.')
      }
      const mark = quotes[position.symbolId]?.price ?? position.entryPrice
      commit(closePaperPosition(book, positionId, mark))
    },
    [book, commit, quotes],
  )

  const resetBook = useCallback(() => {
    commit(resetPaperBook())
  }, [commit])

  const equity = useMemo(() => bookEquity(book, quotes), [book, quotes])

  const value = useMemo(
    () => ({
      book,
      quotes,
      status,
      fallbackUsed,
      equity,
      watch,
      watchSymbols,
      refresh,
      openPosition,
      closePosition,
      resetBook,
    }),
    [
      book,
      closePosition,
      equity,
      fallbackUsed,
      openPosition,
      quotes,
      refresh,
      resetBook,
      status,
      watch,
      watchSymbols,
    ],
  )

  return <PaperBookContext.Provider value={value}>{children}</PaperBookContext.Provider>
}

export function usePaperBook(): PaperBookContextValue {
  const value = useContext(PaperBookContext)
  if (!value) {
    throw new Error('usePaperBook must be used within PaperBookProvider')
  }
  return value
}
