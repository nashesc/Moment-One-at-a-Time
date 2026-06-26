'use client'

import { useState, useEffect } from 'react'
import { useMusic } from '@/context/MusicContext'

export function useFabOffset() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Static per breakpoint — only changes on resize, never transitions
  const base = isDesktop ? '32px' : 'calc(112px + env(safe-area-inset-bottom, 0px))'
  // Amount to lift when MiniPlayer appears (140-112=28px) — desktop FAB doesn't shift
  const liftPx = isDesktop ? 0 : 28

  return { base, liftPx }
}