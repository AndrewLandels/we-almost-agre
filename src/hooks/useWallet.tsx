import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { settleStake, stakeOnContested } from '../lib/points'
import {
  loadWallet,
  resetLocalSeason,
  saveWallet,
  upsertPlayerRow,
} from '../lib/storage'
import type { ClaimAnalysis, StakeSide, Wallet } from '../types'

type WalletContextValue = {
  wallet: Wallet
  setNickname: (nickname: string) => void
  placeStake: (
    analysis: ClaimAnalysis,
    contestedId: string,
    side: StakeSide,
    amount: number,
  ) => void
  resolveStake: (analysis: ClaimAnalysis, contestedId: string) => void
  resetSeason: () => void
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet>(() => {
    const loaded = loadWallet()
    upsertPlayerRow(loaded)
    return loaded
  })

  const commit = useCallback((next: Wallet) => {
    saveWallet(next)
    upsertPlayerRow(next)
    setWallet(next)
  }, [])

  const setNickname = useCallback(
    (nickname: string) => {
      const trimmed = nickname.trim().slice(0, 32)
      if (!trimmed) return
      commit({ ...wallet, nickname: trimmed })
    },
    [commit, wallet],
  )

  const placeStake = useCallback(
    (analysis: ClaimAnalysis, contestedId: string, side: StakeSide, amount: number) => {
      commit(stakeOnContested(wallet, analysis, contestedId, side, amount))
    },
    [commit, wallet],
  )

  const resolveStake = useCallback(
    (analysis: ClaimAnalysis, contestedId: string) => {
      commit(settleStake(wallet, analysis, contestedId))
    },
    [commit, wallet],
  )

  const resetSeason = useCallback(() => {
    commit(resetLocalSeason())
  }, [commit])

  const value = useMemo(
    () => ({ wallet, setNickname, placeStake, resolveStake, resetSeason }),
    [placeStake, resetSeason, resolveStake, setNickname, wallet],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet(): WalletContextValue {
  const value = useContext(WalletContext)
  if (!value) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return value
}
