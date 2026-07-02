import { supabase } from './supabase/server'

export interface UserPlan {
  plan: 'free' | 'pro'
  isPro: boolean
  isTrialActive: boolean
  trialDaysLeft: number
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const { data, error } = await supabase
    .from('user_plans')
    .select('plan, trial_ends_at, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return { plan: 'free', isPro: false, isTrialActive: false, trialDaysLeft: 0, currentPeriodEnd: null, cancelAtPeriodEnd: false }
  }

  const now = new Date()
  const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null
  const isTrialActive = trialEndsAt != null && trialEndsAt > now
  const trialDaysLeft = isTrialActive
    ? Math.ceil((trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const isPro = data.plan === 'pro' || isTrialActive

  return {
    plan: data.plan,
    isPro,
    isTrialActive,
    trialDaysLeft,
    currentPeriodEnd: data.current_period_end ?? null,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
  }
}