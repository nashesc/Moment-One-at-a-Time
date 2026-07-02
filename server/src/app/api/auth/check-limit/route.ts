import { limitAuth } from '@/lib/ratelimit'
import { getClientIp } from '@/lib/getClientIp'
import { optionsResponse, json } from '@/lib/cors'
import { NextRequest } from 'next/server'

export async function OPTIONS(request: NextRequest) { return optionsResponse(request) }

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-client-ip') || getClientIp(request)
  const { success } = await limitAuth(ip)
  if (!success) return json({ error: 'Too many attempts. Try again later.' }, { status: 429 }, request)
  return json({ ok: true }, {}, request)
}