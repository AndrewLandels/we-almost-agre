export function MeetMark({ percent, compact = false }: { percent: number | null; compact?: boolean }) {
  return (
    <div className={compact ? 'meet meet-compact' : 'meet'} aria-hidden="true">
      <svg className="meet-svg" viewBox="0 0 360 168">
        <g className="person teal">
          <circle cx="78" cy="54" r="16" />
          <path d="M50 148c2-34 12-52 28-52s26 18 28 52" />
        </g>
        <g className="person coral">
          <circle cx="282" cy="54" r="16" />
          <path d="M254 148c2-34 12-52 28-52s26 18 28 52" />
        </g>
        <circle className="blob teal" cx="154" cy="96" r="48" />
        <circle className="blob coral" cx="206" cy="96" r="48" />
        <circle className="lens" cx="180" cy="96" r="34" />
      </svg>
      <p className="meet-percent">{percent === null ? '?' : `${percent}%`}</p>
    </div>
  )
}
