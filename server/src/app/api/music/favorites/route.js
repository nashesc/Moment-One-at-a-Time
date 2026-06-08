// server/src/app/api/music/favorites/route.js

import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { rateLimiter } from '@/lib/ratelimit'
import { optionsResponse, json } from '@/lib/cors'
import { z } from 'zod'

export async function OPTIONS(request) { return optionsResponse(request) }

const addFavoriteSchema = z.object({
  track_id: z.string().min(1).max(50),
})

export async function GET(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const { data, error } = await supabase
      .from('track_favorites')
      .select('track_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return json({ error: error.message }, { status: 500 }, request)
    return json({ data }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const body = await request.json()
    const parsed = addFavoriteSchema.safeParse(body)
    if (!parsed.success) return json({ error: parsed.error.issues[0].message }, { status: 400 }, request)

    const { data, error } = await supabase
      .from('track_favorites')
      .insert({ user_id: user.id, track_id: parsed.data.track_id })
      .select()
      .single()

    if (error) {
      // Unique constraint = already favorited, treat as success
      if (error.code === '23505') return json({ data: { already_favorited: true } }, {}, request)
      return json({ error: error.message }, { status: 500 }, request)
    }

    return json({ data }, { status: 201 }, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}


// server/src/app/api/music/favorites/[trackId]/route.js

export async function DELETE_BY_TRACK(request, context) {
  const { trackId } = await context.params
  if (!trackId) return json({ error: 'Track ID required' }, { status: 400 }, request)

  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

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