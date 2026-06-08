'use server'

// client/src/lib/supabase/actions.ts
//
// CHANGED: register() now creates a user_plans row with a 7-day Pro trial
// immediately after auth signup succeeds.

import { createClient } from './server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  email:     z.string().email('Invalid email'),
  password:  z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Name is required').max(100),
})

export async function login(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const parsed = loginSchema.safeParse({
    email:    formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function register(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const parsed = registerSchema.safeParse({
    email:     formData.get('email'),
    password:  formData.get('password'),
    full_name: formData.get('full_name'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email:    parsed.data.email,
    password: parsed.data.password,
    options:  { data: { full_name: parsed.data.full_name } },
  })

  if (error) return { error: error.message }

  // Create user_plans row with a 7-day Pro trial.
  // Do this immediately — the plan route and all Pro gates depend on this row.
  if (data.user) {
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 7)

    const { error: planError } = await supabase
      .from('user_plans')
      .insert({
        user_id:       data.user.id,
        plan:          'free',           // plan = free; isPro comes from trial window
        trial_ends_at: trialEnd.toISOString(),
      })

    // Non-fatal — don't block registration if this fails.
    // The plan route falls back to free-with-no-trial gracefully.
    if (planError) {
      console.error('[Register] Failed to create user_plans row:', planError.message)
    }
  }

  redirect('/splash')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}