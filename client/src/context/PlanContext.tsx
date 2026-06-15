'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
  
interface PlanData {
  plan: 'free' | 'pro'
  isTrialActive: boolean
  isPro: boolean
  trialDaysLeft: number
  currentPeriodEnd: string | null
}

interface PlanContextValue extends PlanData {
  loading: boolean
  refresh: () => Promise<void>
}

const PlanContext = createContext<PlanContextValue | null>(null)

const DEFAULTS: PlanData = {
  plan: 'free',
  isTrialActive: false,
  isPro: false,
  trialDaysLeft: 0,
  currentPeriodEnd: null,
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [data, setData]     = useState<PlanData>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setData(DEFAULTS); setLoading(false); return }

      const plan = await apiFetch<PlanData>('/api/plan')
      setData(plan)
    } catch {
      setData(DEFAULTS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN')  refresh()
      if (event === 'SIGNED_OUT') { setData(DEFAULTS); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [refresh])

  return (
    <PlanContext.Provider value={{ ...data, loading, refresh }}>
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error('usePlan must be used inside PlanProvider')
  return ctx
}