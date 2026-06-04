'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { savePushSubscription } from '@/lib/api'

export interface UserPreferences {
  showOpeningQuote: boolean
  oneTaskAtATime: boolean
  pushNotifications: boolean
  reminderTime: string // "HH:MM" 24h format
}

const DEFAULTS: UserPreferences = {
  showOpeningQuote: true,
  oneTaskAtATime: true,
  pushNotifications: false,
  reminderTime: '09:00',
}

const STORAGE_KEY = 'moment_preferences'

interface SettingsContextValue {
  prefs: UserPreferences
  setPref: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
  requestPushPermission: () => Promise<boolean>
  pushSupported: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULTS)
  const [pushSupported, setPushSupported] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPrefs({ ...DEFAULTS, ...JSON.parse(stored) })
      }
    } catch (err) {
      console.warn('[Settings] Failed to load preferences from storage:', err)
      // Corrupted storage — clear it so next save works cleanly
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }
    setPushSupported('Notification' in window && 'serviceWorker' in navigator)
  }, [])

  const setPref = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (err) {
        console.warn('[Settings] Failed to persist preference — storage may be full:', err)
      }
      return next
    })
  }, [])

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!pushSupported) return false
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setPref('pushNotifications', false)
        return false
      }

      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) return false

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      })

      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
      await savePushSubscription(json)
      setPref('pushNotifications', true)
      return true
    } catch (err) {
      console.error('Push subscription failed:', err)
      setPref('pushNotifications', false)
      return false
    }
  }, [pushSupported, setPref])

  return (
    <SettingsContext.Provider value={{ prefs, setPref, requestPushPermission, pushSupported }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}