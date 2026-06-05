import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { rateLimiter } from '@/lib/ratelimit'
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
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const body = await request.json()
    const parsed = profileUpdateSchema.safeParse(body)
    if (!parsed.success) return json({ error: parsed.error.issues[0].message }, { status: 400 }, request)

    if (parsed.data.email && parsed.data.email !== user.email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
        email: parsed.data.email,
        email_confirm: true,
      })
      if (authError) return json({ error: authError.message }, { status: 400 }, request)
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