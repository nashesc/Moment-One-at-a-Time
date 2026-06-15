import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { rateLimiter } from '@/lib/ratelimit'
import { getUserPlan } from '@/lib/getUserPlan'
import { pushSubscriptionSchema } from '@/lib/validations'
import { sendPushNotification } from '@/lib/push'
import { optionsResponse, json } from '@/lib/cors'
import { getClientIp } from '@/lib/getClientIp'

export async function OPTIONS(request) { return optionsResponse(request) }

export async function POST(request) {
  try {
    const ip = getClientIp(request)
    const { success } = await rateLimiter.limit(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const plan = await getUserPlan(user.id)
    if (!plan.isPro) return json({ error: 'Pro subscription required' }, { status: 403 }, request)

    const body = await request.json()
    const parsed = pushSubscriptionSchema.safeParse(body)
    if (!parsed.success) return json({ error: parsed.error.issues[0].message }, { status: 400 }, request)

    const { error } = await supabase
      .from('subscriptions')
      .upsert({ user_id: user.id, subscription: parsed.data }, { onConflict: 'user_id' })

    if (error) return json({ error: error.message }, { status: 500 }, request)
    return json({ message: 'Subscription saved' }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}

export async function GET(request) {
  try {
    const ip = getClientIp(request)
    const { success } = await rateLimiter.limit(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const { data, error } = await supabase
      .from('subscriptions')
      .select('subscription')
      .eq('user_id', user.id)
      .single()

    if (error || !data) return json({ error: 'No subscription found' }, { status: 404 }, request)

    const result = await sendPushNotification(data.subscription, {
      title: 'Momentum Check-in',
      body: 'How is your current task going?',
      url: '/checkin',
    })

    return json(result, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}