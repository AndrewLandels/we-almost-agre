import { FormEvent, useMemo, useState } from 'react'
import { loadLeaderboard } from '../lib/storage'
import { formatPoints } from '../lib/points'
import { useWallet } from '../hooks/useWallet'

export function LeaderboardPage() {
  const { wallet, setNickname, resetSeason } = useWallet()
  const [draft, setDraft] = useState(wallet.nickname)
  const rows = useMemo(() => loadLeaderboard(), [wallet])

  function onSave(event: FormEvent) {
    event.preventDefault()
    setNickname(draft)
  }

  return (
    <div className="wrap">
      <p className="eyebrow">Play-money season</p>
      <h1>Leaderboard</h1>
      <p className="lede">
        Points live in this browser. Sample names keep the table from looking lonely on a first
        visit. Nothing here is cash, a prize, or a payment.
      </p>

      <form className="nick-row" onSubmit={onSave}>
        <label htmlFor="nickname">
          Nickname
          <input
            id="nickname"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={32}
            style={{ marginLeft: 8 }}
          />
        </label>
        <button className="btn small" type="submit">
          Save name
        </button>
        <button className="btn secondary small" type="button" onClick={resetSeason}>
          Reset my points
        </button>
      </form>

      <div className="board">
        {rows.map((row, index) => (
          <article
            key={row.id}
            className={`card board-row ${row.id === 'you' ? 'you' : ''}`}
          >
            <div className="rank">{index + 1}</div>
            <div>
              <strong>
                {row.nickname}
                {row.id === 'you' ? ' · you' : ''}
                {row.sample ? ' · sample' : ''}
              </strong>
              <p className="hint">
                {row.settled} settled · {row.wins} closer to the demo lean
              </p>
            </div>
            <div>
              <strong>{formatPoints(row.points)}</strong>
              <span className="hint"> pts</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
