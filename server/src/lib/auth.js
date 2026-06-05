import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Short-lived token cache — avoids Supabase round-trip on every request
// Key: token (first 40 chars), Value: { user, expiresAt }
const _tokenCache = new Map()
const TOKEN_CACHE_TTL = 30_000 // 30 seconds

export async function getUser(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !parts[1]) return null

    const token = parts[1]
    const cacheKey = token.slice(0, 40) // use prefix as cache key

    // Return cached user if still fresh
    const cached = _tokenCache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) {
      return cached.user
    }

    // Verify with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      _tokenCache.delete(cacheKey)
      return null
    }

    // Cache the result
    _tokenCache.set(cacheKey, { user, expiresAt: Date.now() + 10_000 })

    // Prevent unbounded cache growth — clear oldest entries if over 500
    if (_tokenCache.size > 500) {
      const evictCount = Math.floor(_tokenCache.size * 0.1)
      const keys = Array.from(_tokenCache.keys()).slice(0, evictCount)
      keys.forEach(k => _tokenCache.delete(k))
    } 

    return user
  } catch {
    return null
  }
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