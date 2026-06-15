// server/src/app/api/music/favorites/[trackId]/route.js

import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { rateLimiter } from '@/lib/ratelimit'
import { getUserPlan } from '@/lib/getUserPlan'
import { optionsResponse, json } from '@/lib/cors'
import { getClientIp } from '@/lib/getClientIp'

export async function OPTIONS(request) { return optionsResponse(request) }

export async function DELETE(request, context) {
  const { trackId } = await context.params
  if (!trackId) return json({ error: 'Track ID required' }, { status: 400 }, request)

  try {
    const ip = getClientIp(request)
    const { success } = await rateLimiter.limit(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const plan = await getUserPlan(user.id)
    if (!plan.isPro) return json({ error: 'Pro subscription required' }, { status: 403 }, request)

    const { error } = await supabase
      .from('track_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('track_id', trackId)

    if (error) return json({ error: error.message }, { status: 500 }, request)
    return json({ data: { deleted: true } }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}