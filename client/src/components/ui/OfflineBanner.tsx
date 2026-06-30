'use client'

import { useState, useEffect } from 'react'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="mx-4 md:mx-8 rounded-2xl px-4 py-3 mt-3 text-[13px]"
      style={{ background: '#FAEEDA', border: '1px solid #EDD59A', color: '#854F0B' }}>
      You're offline — changes will sync when you reconnect.
    </div>
  )
}