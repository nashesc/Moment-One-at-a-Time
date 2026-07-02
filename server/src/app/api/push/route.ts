import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { limitStandard, limitWrite } from '@/lib/ratelimit'
import { getUserPlan } from '@/lib/getUserPlan'
import { pushSubscriptionSchema } from '@/lib/validations'
import { sendPushNotification } from '@/lib/push'
import { optionsResponse, json } from '@/lib/cors'
import { getClientIp } from '@/lib/getClientIp'
import { NextRequest } from 'next/server'

export async function OPTIONS(request: NextRequest) { return optionsResponse(request) }

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const { success } = await limitWrite(`user:${user.id}`)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const plan = await getUserPlan(user.id)
    if (!plan.isPro) return json({ error: 'Pro subscription required' }, { status: 403 }, request)

    const body: unknown = await request.json()
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

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { success } = await limitStandard(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    try {
      const user = await getUser(request)
      if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)
      const { data, error } = await supabase.from('subscriptions').select('user_id').eq('user_id', user.id).maybeSingle()
      if (error) return json({ error: error.message }, { status: 500 }, request)
      return json({ data: { subscribed: !!data } }, {}, request)
    } catch {
      return json({ error: 'Internal server error' }, { status: 500 }, request)
    }
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}