'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
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

// Scoped per user so accounts don't bleed into each other
function storageKey(userId: string) {
  return `moment_preferences_${userId}`
}

function loadPrefs(userId: string): UserPreferences {
  try {
    const stored = localStorage.getItem(storageKey(userId))
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) }
  } catch (err) {
    console.warn('[Settings] Failed to load preferences:', err)
    try { localStorage.removeItem(storageKey(userId)) } catch {}
  }
  return { ...DEFAULTS }
}

function savePrefs(userId: string, prefs: UserPreferences) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(prefs))
  } catch (err) {
    console.warn('[Settings] Failed to persist preferences — storage may be full:', err)
  }
}

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
  // Track the current user ID so we can scope storage and detect account switches
  const userIdRef = useRef<string | null>(null)

  // Load prefs for a given user — resets to defaults if different user
  const loadForUser = useCallback((userId: string | null) => {
    if (!userId) {
      setPrefs({ ...DEFAULTS })
      userIdRef.current = null
      return
    }
    userIdRef.current = userId
    setPrefs(loadPrefs(userId))
  }, [])

  useEffect(() => {
    setPushSupported('Notification' in window && 'serviceWorker' in navigator)

    // Load prefs for the current session on mount
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      loadForUser(session?.user?.id ?? null)
    }
    init()

    // Re-load (or clear) prefs whenever auth state changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return
      if (event === 'SIGNED_IN') {
        const userId = session?.user?.id ?? null
        // Only reload if the user actually changed (avoid spurious resets)
        if (userId && userId !== userIdRef.current) {
          loadForUser(userId)
        }
      } else if (event === 'SIGNED_OUT') {
        loadForUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadForUser])

  const setPref = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value }
      if (userIdRef.current) {
        savePrefs(userIdRef.current, next)
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