import { useEffect, useRef } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallSheet({
  promptEvent,
  onClose,
}: {
  promptEvent: BeforeInstallPromptEvent | null
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  useEffect(() => {
    closeRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="install-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="install-title">Get the app</h2>
        <p>It lives on your home screen. No app store, and no account.</p>
        {promptEvent ? (
          <button
            className="solid-btn"
            type="button"
            onClick={() => {
              void promptEvent.prompt().then(() => onClose())
            }}
          >
            Install
          </button>
        ) : null}
        {ios ? (
          <ol className="install-steps">
            <li>Open this page in Safari.</li>
            <li>Tap the Share button (the square with an arrow).</li>
            <li>Scroll down and tap Add to Home Screen, then Add.</li>
          </ol>
        ) : (
          <ol className="install-steps">
            <li>On iPhone, use Safari’s Share button, then Add to Home Screen.</li>
            <li>On Android, open the browser menu and tap Install app or Add to Home screen.</li>
            <li>On a computer, look for the install icon in the address bar.</li>
          </ol>
        )}
        <button ref={closeRef} className="quiet-btn" type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
