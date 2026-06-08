// server/src/lib/getUserPlan.js
//
// Shared utility — called by /api/plan and any route that needs to
// enforce Pro-only access (tasks, recap, checkins, push, music).
//
// Returns a plain object so it can be used anywhere without importing
// Supabase directly in every route.

import { supabase } from './supabase/server'

/**
 * @param {string} userId
 * @returns {Promise<{
 *   plan: 'free' | 'pro',
 *   isPro: boolean,
 *   isTrialActive: boolean,
 *   trialDaysLeft: number,
 *   currentPeriodEnd: string | null,
 *   cancelAtPeriodEnd: boolean,
 * }>}
 */
export async function getUserPlan(userId) {
  const { data, error } = await supabase
    .from('user_plans')
    .select('plan, trial_ends_at, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .single()

  // No row yet (edge case: registered before user_plans was wired up)
  if (error || !data) {
    return {
      plan: 'free',
      isPro: false,
      isTrialActive: false,
      trialDaysLeft: 0,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    }
  }

  const now          = new Date()
  const trialEndsAt  = data.trial_ends_at ? new Date(data.trial_ends_at) : null
  const isTrialActive = trialEndsAt != null && trialEndsAt > now

  const trialDaysLeft = isTrialActive
    ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // isPro = paid Pro plan OR still inside trial window
  const isPro = data.plan === 'pro' || isTrialActive

  return {
    plan: data.plan,
    isPro,
    isTrialActive,
    trialDaysLeft,
    currentPeriodEnd:   data.current_period_end   ?? null,
    cancelAtPeriodEnd:  data.cancel_at_period_end ?? false,
  }
}