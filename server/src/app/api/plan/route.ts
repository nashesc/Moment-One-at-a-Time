import { getUser } from '@/lib/auth'
import { limitStandard } from '@/lib/ratelimit'
import { getUserPlan } from '@/lib/getUserPlan'
import { optionsResponse, json } from '@/lib/cors'
import { getClientIp } from '@/lib/getClientIp'
import { NextRequest } from 'next/server'

export async function OPTIONS(request: NextRequest) { return optionsResponse(request) }

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { success } = await limitStandard(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const authStart = Date.now()
    const user = await getUser(request)
    console.log('[timing] getUser:', Date.now() - authStart, 'ms')
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const dbStart = Date.now()
    const plan = await getUserPlan(user.id)
    console.log('[timing] getUserPlan (db):', Date.now() - dbStart, 'ms')

    return json({ data: plan }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}