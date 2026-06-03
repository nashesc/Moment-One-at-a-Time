import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getUser, unauthorized, badRequest, serverError } from '@/lib/auth'
import { pushSubscriptionSchema } from '@/lib/validations'
import { sendPushNotification } from '@/lib/push'
import { rateLimiter } from '@/lib/ratelimit'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// Save push subscription
export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const user = await getUser(request)
    if (!user) return unauthorized()

    const body = await request.json()
    const parsed = pushSubscriptionSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        subscription: parsed.data,
      }, { onConflict: 'user_id' })

    if (error) return serverError(error.message)

    return NextResponse.json({ message: 'Subscription saved' })
  } catch (err) {
    return serverError()
  }
}

// Send test push notification
export async function GET(request) {
  try {
    const user = await getUser(request)
    if (!user) return unauthorized()

    const { data, error } = await supabase
      .from('subscriptions')
      .select('subscription')
      .eq('user_id', user.id)
      .single()

    if (error || !data) return NextResponse.json({ error: 'No subscription found' }, { status: 404 })

    const result = await sendPushNotification(data.subscription, {
      title: 'Momentum Check-in',
      body: 'How is your current task going?',
      url: '/checkin',
    })

    return NextResponse.json(result)
  } catch (err) {
    return serverError()
  }
}