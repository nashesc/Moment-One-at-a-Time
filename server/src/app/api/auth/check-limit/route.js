import { authRateLimiter } from '@/lib/ratelimit'
import { getClientIp } from '@/lib/getClientIp'
import { optionsResponse, json } from '@/lib/cors'

export async function OPTIONS(request) { return optionsResponse(request) }

export async function POST(request) {
  const ip = request.headers.get('x-client-ip') || getClientIp(request)
  const { success } = await authRateLimiter.limit(ip)
  if (!success) return json({ error: 'Too many attempts. Try again later.' }, { status: 429 }, request)
  return json({ ok: true }, {}, request)
}