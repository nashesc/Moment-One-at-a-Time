import { supabase } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/auth'
import { writeLimiter } from '@/lib/ratelimit'
import { optionsResponse, json } from '@/lib/cors'
import { z } from 'zod'

export async function OPTIONS(request) { return optionsResponse(request) }

const profileUpdateSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
}).refine(d => d.full_name !== undefined || d.email !== undefined, {
  message: 'At least one field required',
})

export async function PATCH(request) {
  try {
    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const { success } = await writeLimiter.limit(`user:${user.id}`)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const body = await request.json()
    const parsed = profileUpdateSchema.safeParse(body)
    if (!parsed.success) return json({ error: parsed.error.issues[0].message }, { status: 400 }, request)

    if (parsed.data.email && parsed.data.email !== user.email) {
      // Service-role admin.updateUserById changes auth.users.email immediately,
      // confirmed or not — that's an account-takeover vector if a token leaks.
      // Use a client scoped to the requester's own token instead, so Supabase's
      // built-in secure-email-change flow runs: it sends a confirmation to the
      // new address and the email doesn't take effect until that's clicked.
      const token = request.headers.get('authorization')?.split(' ')[1]
      const userClient = createSupabaseClient(
        process.env.SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      )
      const { error: authError } = await userClient.auth.updateUser({ email: parsed.data.email })
      if (authError) return json({ error: 'Could not update email. Please try again.' }, { status: 400 }, request)
    }

    if (parsed.data.full_name !== undefined) {
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { full_name: parsed.data.full_name },
      })
    }
    // Update profiles table
    const profileUpdates = {}
    if (parsed.data.full_name !== undefined) profileUpdates.full_name = parsed.data.full_name
    if (parsed.data.email !== undefined) profileUpdates.email = parsed.data.email

    const { error: dbError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)

    if (dbError) return json({ error: dbError.message }, { status: 500 }, request)

    return json({ data: { updated: true } }, {}, request)
  } catch (err) {
    console.error('[Profile] Update failed:', err)
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}