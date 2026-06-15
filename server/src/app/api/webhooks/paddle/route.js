// server/src/app/api/webhooks/paddle/route.js
//
// Receives and verifies Paddle Billing webhook events.
// Paddle signs each request with HMAC-SHA256. We verify before touching the DB.
//
// Required env var: PADDLE_WEBHOOK_SECRET
// (copy from Paddle Dashboard → Notifications → your webhook endpoint → secret key)

import { createHmac, timingSafeEqual } from 'crypto'
import { supabase } from '@/lib/supabase/server'
import { json } from '@/lib/cors'

// ─── Signature Verification ────────────────────────────────────────────────
//
// Paddle-Signature header format:  ts=1671552000;h1=<hmac_sha256_hex>
// Signed payload:                  "<ts>:<raw_body>"
// Algorithm:                       HMAC-SHA256 with your webhook secret key

async function verifySignature(request, rawBody) {
  const header = request.headers.get('paddle-signature')
  if (!header) return false

  // Parse "ts=...;h1=..."
  const parts = {}
  for (const segment of header.split(';')) {
    const [key, ...rest] = segment.split('=')
    parts[key] = rest.join('=')          // re-join in case value contains '='
  }

  const { ts, h1 } = parts
  if (!ts || !h1) return false

  // Reject stale webhooks older than 5 minutes (replay attack prevention)
  const age = Math.abs(Math.floor(Date.now() / 1000) - parseInt(ts, 10))
  if (age > 300) return false

  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[Paddle] PADDLE_WEBHOOK_SECRET is not set')
    return false
  }

  const expected = createHmac('sha256', secret)
    .update(`${ts}:${rawBody}`)
    .digest('hex')

  // Constant-time comparison — prevents timing attacks
  try {
    return timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(h1, 'hex')
    )
  } catch {
    return false   // buffers of different lengths also fail safely
  }
}

// ─── User Resolution ────────────────────────────────────────────────────────
//
// Three fallback strategies to find the Moment user from a Paddle event:
//   1. custom_data.user_id  — set during checkout (most reliable, use this)
//   2. paddle_customer_id   — match existing user_plans row
//   3. customer email       — match profiles table as last resort

async function resolveUserId(data) {
  // 1. Custom data passed at checkout time
  if (data.custom_data?.user_id) {
    return data.custom_data.user_id
  }

  // 2. Already have a user_plans row keyed to this Paddle customer
  if (data.customer_id) {
    const { data: plan } = await supabase
      .from('user_plans')
      .select('user_id')
      .eq('paddle_customer_id', data.customer_id)
      .maybeSingle()
    if (plan?.user_id) return plan.user_id
  }

  // 3. Email lookup — Paddle embeds customer object in some events
  const email = data.customer?.email
  if (email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (profile?.id) return profile.id
  }

  return null
}

// ─── Event Handlers ─────────────────────────────────────────────────────────

async function handleActivated(data) {
  const userId = await resolveUserId(data)
  if (!userId) {
    console.error('[Paddle] subscription.activated — could not resolve user. sub_id:', data.id)
    return
  }

  if (data.custom_data?.user_id) {
  // No email = can't verify = reject. Never trust client-supplied user_id without proof.
  if (!data.customer?.email) {
    console.error('[Paddle] Rejecting — custom_data.user_id present but no customer email to verify against. sub_id:', data.id)
    return
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()
  if (!profile || profile.email.toLowerCase() !== data.customer.email.toLowerCase()) {
    console.error('[Paddle] Email/user_id mismatch — rejecting. sub_id:', data.id)
    return
  }
}

  const { error } = await supabase
    .from('user_plans')
    .upsert(
      {
        user_id:            userId,
        plan:               'pro',
        subscription_id:    data.id,
        paddle_customer_id: data.customer_id,
        current_period_end: data.current_billing_period?.ends_at ?? null,
        cancel_at_period_end: false,
        updated_at:         new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) console.error('[Paddle] handleActivated DB error:', error.message)
}

async function handleUpdated(data) {
  const userId = await resolveUserId(data)
  if (!userId) return

  // scheduled_change.action === 'cancel' means they've cancelled but period isn't over
  const cancelAtPeriodEnd = data.scheduled_change?.action === 'cancel'

  const updates = {
    current_period_end:   data.current_billing_period?.ends_at ?? null,
    cancel_at_period_end: cancelAtPeriodEnd,
    updated_at:           new Date().toISOString(),
  }

  // If the subscription was reactivated (e.g. they un-cancelled)
  if (data.status === 'active' && !cancelAtPeriodEnd) {
    updates.plan = 'pro'
  }

  const { error } = await supabase
    .from('user_plans')
    .update(updates)
    .eq('user_id', userId)

  if (error) console.error('[Paddle] handleUpdated DB error:', error.message)
}

async function handleCanceled(data) {
  const userId = await resolveUserId(data)
  if (!userId) return

  // Keep them on Pro until their period ends — just flag the cancellation.
  // The plan route's isPro check handles expiry automatically via current_period_end.
  const { error } = await supabase
    .from('user_plans')
    .update({
      cancel_at_period_end: true,
      updated_at:           new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) console.error('[Paddle] handleCanceled DB error:', error.message)
}

async function handlePastDue(data) {
  const userId = await resolveUserId(data)
  if (!userId) return

  // Surface this to the user via the plan route — they'll see isPro = false
  // once the period ends. For now just log; you could trigger an email here.
  console.warn('[Paddle] subscription.past_due — user:', userId, 'sub:', data.id)
}

// ─── Route Handler ───────────────────────────────────────────────────────────

// OPTIONS not needed — Paddle doesn't send preflight — but harmless to keep
export async function OPTIONS() {
  return new Response(null, { status: 204 })
}

export async function POST(request) {
  let rawBody

  try {
    rawBody = await request.text()
  } catch {
    return json({ error: 'Could not read request body' }, { status: 400 }, request)
  }

  // Always verify before doing anything else
  const valid = await verifySignature(request, rawBody)
  if (!valid) {
    console.warn('[Paddle] Webhook rejected — invalid or missing signature')
    return json({ error: 'Invalid signature' }, { status: 401 }, request)
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 }, request)
  }

  const { event_type, data } = event

  try {
    switch (event_type) {
      case 'subscription.activated': await handleActivated(data); break
      case 'subscription.updated':   await handleUpdated(data);   break
      case 'subscription.canceled':  await handleCanceled(data);  break
      case 'subscription.past_due':  await handlePastDue(data);   break
      default:
        // Acknowledge all other events without processing them
        // (Paddle retries if you return non-2xx)
        break
    }
  } catch (err) {
    console.error('[Paddle] Unhandled error in event handler:', err)
    // Return 200 anyway — returning 500 causes Paddle to retry indefinitely
    // Log the error and investigate rather than creating a retry storm
  }

  return json({ data: { received: true } }, {}, request)
}