import { DISCLAIMER_CHROME } from '../lib/markets/copy'

export function DisclaimerBar() {
  return (
    <div className="disclaimer-bar" role="note">
      <div className="wrap">{DISCLAIMER_CHROME}</div>
    </div>
  )
}
