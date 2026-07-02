import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { getUserPlan } from '@/lib/getUserPlan'
import { limitWrite } from '@/lib/ratelimit'
import { optionsResponse, json } from '@/lib/cors'
import { TRACKS } from '@/lib/tracksCatalog' // server copy: id, path, isPro only — kept in sync with client
import { NextRequest } from 'next/server'

export async function OPTIONS(request: NextRequest) { return optionsResponse(request) }

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const { success } = await limitWrite(`user:${user.id}`)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const trackId = new URL(request.url).searchParams.get('trackId')
    const track = TRACKS.find(t => t.id === trackId)
    if (!track) return json({ error: 'Track not found' }, { status: 404 }, request)

    if (track.isPro) {
      const plan = await getUserPlan(user.id)
      if (!plan.isPro) return json({ error: 'Pro subscription required' }, { status: 403 }, request)
    }

    const { data, error } = await supabase.storage.from('music').createSignedUrl(track.path, 600)
    if (error) return json({ error: error.message }, { status: 500 }, request)
    return json({ data: { url: data.signedUrl } }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}