// server/src/app/api/music/favorites/route.js

import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { limitStandard, limitWrite } from '@/lib/ratelimit'
import { getUserPlan } from '@/lib/getUserPlan'
import { optionsResponse, json } from '@/lib/cors'
import { z } from 'zod'
import { getClientIp } from '@/lib/getClientIp'
import { NextRequest } from 'next/server'

export async function OPTIONS(request: NextRequest) { return optionsResponse(request) }

const addFavoriteSchema = z.object({
  track_id: z.string().min(1).max(50),
})

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { success } = await limitStandard(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const plan = await getUserPlan(user.id)
    if (!plan.isPro) return json({ error: 'Pro subscription required' }, { status: 403 }, request)

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

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const { success } = await limitWrite(`user:${user.id}`)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const plan = await getUserPlan(user.id)
    if (!plan.isPro) return json({ error: 'Pro subscription required' }, { status: 403 }, request)

    const body: unknown = await request.json()
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