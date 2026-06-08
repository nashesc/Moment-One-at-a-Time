// server/src/app/api/plan/route.js
//
// CHANGED: now uses the shared getUserPlan() helper instead of
// duplicating the trial/isPro logic inline.

import { getUser } from '@/lib/auth'
import { rateLimiter } from '@/lib/ratelimit'
import { getUserPlan } from '@/lib/getUserPlan'
import { optionsResponse, json } from '@/lib/cors'

export async function OPTIONS(request) { return optionsResponse(request) }

export async function GET(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const plan = await getUserPlan(user.id)
    return json({ data: plan }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}