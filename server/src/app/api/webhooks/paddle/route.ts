import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { json } from '@/lib/cors'

interface PaddleSubscriptionData {
  id: string
  customer_id?: string
  status?: string
  custom_data?: { user_id?: string }
  customer?: { email?: string }
  current_billing_period?: { ends_at?: string }
  scheduled_change?: { action?: string }
}

interface PaddleWebhookEvent {
  event_type: string
  data: PaddleSubscriptionData
}

async function verifySignature(request: NextRequest, rawBody: string): Promise<boolean> {
  const header = request.headers.get('paddle-signature')
  if (!header) return false

  const parts: Record<string, string> = {}
  for (const segment of header.split(';')) {
    const [key, ...rest] = segment.split('=')
    parts[key] = rest.join('=')
  }

  const { ts, h1 } = parts
  if (!ts || !h1) return false

  const age = Math.abs(Math.floor(Date.now() / 1000) - parseInt(ts, 10))
  if (age > 300) return false

  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[Paddle] PADDLE_WEBHOOK_SECRET is not set')
    return false
  }

  const expected = createHmac('sha256', secret).update(`${ts}:${rawBody}`).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(h1, 'hex'))
  } catch {
    return false
  }
}

async function resolveUserId(data: PaddleSubscriptionData): Promise<string | null> {
  if (data.custom_data?.user_id) return data.custom_data.user_id

  if (data.customer_id) {
    const { data: plan } = await supabase
      .from('user_plans').select('user_id').eq('paddle_customer_id', data.customer_id).maybeSingle()
    if (plan?.user_id) return plan.user_id
  }

  if (data.customer?.email) {
    const { data: profile } = await supabase
      .from('profiles').select('id').eq('email', data.customer.email).maybeSingle()
    if (profile?.id) return profile.id
  }

  return null
}

async function logWebhookFailure(eventType: string, data: PaddleSubscriptionData) {
  const { error } = await supabase.from('webhook_failures').insert({
    event_type: eventType,
    paddle_subscription_id: data.id,
    raw_payload: data,
    created_at: new Date().toISOString(),
  })
  if (error) console.error('[Paddle] Failed to log webhook failure:', error.message)
}

async function handleActivated(data: PaddleSubscriptionData) {
  const userId = await resolveUserId(data)
  if (!userId) {
    console.error('[Paddle] subscription.activated — could not resolve user. sub_id:', data.id)
    await logWebhookFailure('subscription.activated', data)
    return
  }

  if (data.custom_data?.user_id) {
    if (!data.customer?.email) {
      console.error('[Paddle] Rejecting — custom_data.user_id present but no customer email to verify against. sub_id:', data.id)
      return
    }
    const { data: authUser } = await supabase.auth.admin.getUserById(userId)
    if (!authUser?.user?.email || authUser.user.email.toLowerCase() !== data.customer.email.toLowerCase()) {
      console.error('[Paddle] Email/user_id mismatch — rejecting. sub_id:', data.id)
      return
    }
  }

  const { error } = await supabase.from('user_plans').upsert(
    {
      user_id: userId,
      plan: 'pro',
      subscription_id: data.id,
      paddle_customer_id: data.customer_id,
      current_period_end: data.current_billing_period?.ends_at ?? null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
  if (error) console.error('[Paddle] handleActivated DB error:', error.message)
}

async function handleUpdated(data: PaddleSubscriptionData, eventType: string) {
  const userId = await resolveUserId(data)
  if (!userId) {
    console.error(`[Paddle] ${eventType} — could not resolve user. sub_id:`, data.id)
    await logWebhookFailure(eventType, data)
    return
  }

  const cancelAtPeriodEnd = data.scheduled_change?.action === 'cancel'
  const updates: Record<string, unknown> = {
    current_period_end: data.current_billing_period?.ends_at ?? null,
    cancel_at_period_end: cancelAtPeriodEnd,
    updated_at: new Date().toISOString(),
  }
  if (data.status === 'active' && !cancelAtPeriodEnd) updates.plan = 'pro'

  const { error } = await supabase.from('user_plans').update(updates).eq('user_id', userId)
  if (error) console.error('[Paddle] handleUpdated DB error:', error.message)
}

async function handleCanceled(data: PaddleSubscriptionData, eventType: string) {
  const userId = await resolveUserId(data)
  if (!userId) {
    console.error(`[Paddle] ${eventType} — could not resolve user. sub_id:`, data.id)
    await logWebhookFailure(eventType, data)
    return
  }
  const { error } = await supabase
    .from('user_plans').update({ cancel_at_period_end: true, updated_at: new Date().toISOString() }).eq('user_id', userId)
  if (error) console.error('[Paddle] handleCanceled DB error:', error.message)
}

async function handlePastDue(data: PaddleSubscriptionData) {
  const userId = await resolveUserId(data)
  if (!userId) return
  console.warn('[Paddle] subscription.past_due — user:', userId, 'sub:', data.id)
}

export async function OPTIONS() {
  return new Response(null, { status: 204 })
}

export async function POST(request: NextRequest) {
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return json({ error: 'Could not read request body' }, { status: 400 }, request)
  }

  if (!(await verifySignature(request, rawBody))) {
    console.warn('[Paddle] Webhook rejected — invalid or missing signature')
    return json({ error: 'Invalid signature' }, { status: 401 }, request)
  }

  let event: PaddleWebhookEvent
  try {
    event = JSON.parse(rawBody) as PaddleWebhookEvent // assertion, not validation — see note above
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 }, request)
  }

  const { event_type, data } = event
  try {
    switch (event_type) {
      case 'subscription.activated': await handleActivated(data); break
      case 'subscription.updated':   await handleUpdated(data, event_type); break
      case 'subscription.canceled':  await handleCanceled(data, event_type); break
      case 'subscription.past_due':  await handlePastDue(data); break
      default: break
    }
  } catch (err) {
    console.error('[Paddle] Unhandled error in event handler:', err)
  }

  return json({ data: { received: true } }, {}, request)
}