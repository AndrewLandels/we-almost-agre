import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { DISCLAIMER_CHROME } from '../../lib/markets/copy'
import { InstallSheet } from './InstallSheet'
import './agree.css'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function installedAlready(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

export function AgreeLayout() {
  const [open, setOpen] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    setInstalled(installedAlready())
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    let theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const createdTheme = !theme
    if (!theme) {
      theme = document.createElement('meta')
      theme.name = 'theme-color'
      document.head.appendChild(theme)
    }
    const previousTheme = theme.content
    theme.content = '#fbf7f2'

    const links: HTMLElement[] = []
    const add = (element: HTMLElement) => {
      document.head.appendChild(element)
      links.push(element)
    }
    const manifest = document.createElement('link')
    manifest.rel = 'manifest'
    manifest.href = '/agree/manifest.webmanifest'
    add(manifest)
    const apple = document.createElement('link')
    apple.rel = 'apple-touch-icon'
    apple.href = '/agree/apple-touch-icon.png'
    add(apple)
    const capable = document.createElement('meta')
    capable.name = 'apple-mobile-web-app-capable'
    capable.content = 'yes'
    add(capable)
    const title = document.createElement('meta')
    title.name = 'apple-mobile-web-app-title'
    title.content = 'Almost Agree'
    add(title)

    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/agree-sw.js').catch(() => undefined)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      if (createdTheme) theme?.remove()
      else if (theme) theme.content = previousTheme
      links.forEach((element) => element.remove())
    }
  }, [])

  return (
    <div className="agree-app">
      <a className="agree-skip" href="#agree-main">
        Skip to content
      </a>
      <header className="agree-header">
        <div className="agree-header-inner">
          <Link to="/agree" className="agree-brand">
            <svg className="agree-mark" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="26" cy="32" r="14" className="teal" />
              <circle cx="38" cy="32" r="14" className="coral" />
              <circle cx="32" cy="32" r="6" className="paper" />
            </svg>
            <span>
              <span className="agree-brand-name">We Almost Agree</span>
              <span className="agree-brand-tag">Find the overlap</span>
            </span>
          </Link>
          {installed ? null : (
            <button className="app-btn" type="button" onClick={() => setOpen(true)}>
              Get the app
            </button>
          )}
        </div>
      </header>
      <main id="agree-main" className="agree-main">
        <Outlet />
      </main>
      <footer className="agree-footer">
        <p>Anonymous. Only people with the link can see the answers. Links last 30 days.</p>
        <p>{DISCLAIMER_CHROME}</p>
        <p>
          <Link to="/">The rest of the site</Link>
        </p>
      </footer>
      {open ? <InstallSheet promptEvent={promptEvent} onClose={() => setOpen(false)} /> : null}
    </div>
  )
}
