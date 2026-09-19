import { useEffect } from 'react'

const SITE = 'We Almost Agree'

export function usePageTitle(title?: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · ${SITE}` : SITE
    return () => {
      document.title = previous
    }
  }, [title])
}
