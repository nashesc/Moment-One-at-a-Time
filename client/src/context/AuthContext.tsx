'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'

export interface UserProfile {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  created_at?: string
}

interface AuthContextValue {
  profile: UserProfile | null
  loading: boolean
  updateProfile: (data: { full_name?: string; email?: string }) => Promise<{ error?: string }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const isUpdatingRef = useRef(false)

  const refreshProfile = useCallback(async () => {
    if (isUpdatingRef.current) return
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfile(null); return }

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, created_at')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile({
          id: data.id,
          full_name: data.full_name ?? user.user_metadata?.full_name ?? '',
          email: data.email ?? user.email ?? '',
          avatar_url: data.avatar_url,
          created_at: data.created_at,
        })
      } else {
        setProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name ?? '',
          email: user.email ?? '',
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[Auth] refreshProfile failed:', message)
    }
  }, [])

  useEffect(() => {
    const run = async () => {
      await refreshProfile()
      setLoading(false)
    }
    run()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        refreshProfile()
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [refreshProfile])

  const updateProfile = useCallback(async (data: { full_name?: string; email?: string }) => {
    if (!profile) return { error: 'Not authenticated' }
    isUpdatingRef.current = true
    try {
      await apiFetch<{ updated: boolean }>('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })

      // Optimistically update local state immediately
      setProfile(prev => {
        if (!prev) return prev
        return {
          ...prev,
          ...(data.full_name !== undefined && { full_name: data.full_name }),
          ...(data.email !== undefined && { email: data.email }),
        }
      })

      // Then re-fetch from Supabase to ensure we're in sync with the DB
      isUpdatingRef.current = false
      await refreshProfile()

      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      return { error: message }
    } finally {
      isUpdatingRef.current = false
    }
  }, [profile, refreshProfile])

  return (
    <AuthContext.Provider value={{ profile, loading, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}