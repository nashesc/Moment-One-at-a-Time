'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  full_name: string
  email: string
  avatar_url?: string
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

  const refreshProfile = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfile(null); return }

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile({
          id: data.id,
          full_name: data.full_name ?? user.user_metadata?.full_name ?? '',
          email: data.email ?? user.email ?? '',
          avatar_url: data.avatar_url,
        })
      } else {
        // Profile row may not exist yet — fall back to auth metadata
        setProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name ?? '',
          email: user.email ?? '',
        })
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }, [])

  useEffect(() => {
    const run = async () => {
      await refreshProfile()
      setLoading(false)
    }
    run()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshProfile()
    })
    return () => subscription.unsubscribe()
  }, [refreshProfile])

  const updateProfile = useCallback(async (data: { full_name?: string; email?: string }) => {
    if (!profile) return { error: 'Not authenticated' }
    try {
      const supabase = createClient()

      // Update email in Supabase Auth if changed
      if (data.email && data.email !== profile.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: data.email })
        if (authError) return { error: authError.message }
      }

      // Update profile table
      const updates: Record<string, string> = {}
      if (data.full_name !== undefined) updates.full_name = data.full_name
      if (data.email !== undefined) updates.email = data.email

      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({ id: profile.id, ...updates })

      if (dbError) return { error: dbError.message }

      setProfile(prev => prev ? { ...prev, ...updates } : prev)
      return {}
    } catch (err) {
      return { error: 'Failed to update profile' }
    }
  }, [profile])

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