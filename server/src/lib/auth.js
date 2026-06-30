import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const CACHE_TTL = 60 // seconds — only verified results are cached, so a
                      // revoked token still gets caught within this window

// Mirrors the caching strategy proxy.ts already uses for the client middleware.
// Two services can't share one in-memory check, but they can share the same
// pattern — and on Vercel, Redis is the only thing that's actually warm
// across invocations, not module scope.
export async function getUser(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !parts[1]) return null
    const token = parts[1]

    const cacheKey = `api:auth:${token.slice(0, 16)}`
    try {
      const cached = await redis.get(cacheKey)
      if (cached) return cached
    } catch {
      // Redis down — fall through to direct verification
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null

    const result = { id: user.id, email: user.email ?? '' }
    try {
      await redis.setex(cacheKey, CACHE_TTL, result)
    } catch {
      // Redis down — continue without caching
    }

    return result
  } catch { return null }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json({ error: message }, { status: 500 })
}