import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { writeLimiter } from '@/lib/ratelimit'
import { sendPushNotification } from '@/lib/push'
import { optionsResponse, json } from '@/lib/cors'

export async function OPTIONS(request) { return optionsResponse(request) }

export async function POST(request) {
   try {
      const user = await getUser(request)
      if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)
      const { success } = await writeLimiter.limit(`user:${user.id}`)
      if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)
      const { data, error } = await supabase.from('subscriptions').select('subscription').eq('user_id', user.id).single()
      if (error || !data) return json({ error: 'No subscription found' }, { status: 404 }, request)
      const result = await sendPushNotification(data.subscription, { title: 'Momentum Check-in', body: 'How is your current task going?', url: '/checkin' })
      return json(result, {}, request)
   } catch {
      return json({ error: 'Internal server error' }, { status: 500 }, request)
   }
}