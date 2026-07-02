import { NextResponse, type NextRequest } from 'next/server'
import * as jose from 'jose'
import { Redis } from '@upstash/redis'
import { createHash } from 'crypto'

// Same rotation-safe verification as client proxy.ts — see that file for
// why a static HS256 secret broke after Supabase moved to ECC keys.
const SUPABASE_URL = process.env.SUPABASE_URL
if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not set — required for JWKS verification')
}
const JWKS = jose.createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`))

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const CACHE_TTL = 60
const REDIS_TIMEOUT_MS = 400

export interface AuthUser {
  id: string
  email: string
}

function redisWith<T>(op: Promise<T>): Promise<T> {
  return Promise.race([
    op,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), REDIS_TIMEOUT_MS)),
  ])
}

async function verifyJwt(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWKS)
    if (!payload.sub) return null
    return { id: payload.sub, email: (payload.email as string) ?? '' }
  } catch {
    return null
  }
}

export async function getUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !parts[1]) return null
  const token = parts[1]

  const key = `api:auth:${createHash('sha256').update(token).digest('hex')}`

  const redisStart = Date.now()
  try {
    const cached = await redisWith(redis.get<AuthUser>(key))
    if (cached) {
      console.log('[timing] redis hit:', Date.now() - redisStart, 'ms')
      return cached
    }
    console.log('[timing] redis miss:', Date.now() - redisStart, 'ms')
  } catch {
    console.log('[timing] redis error/timeout:', Date.now() - redisStart, 'ms')
  }

  const jwksStart = Date.now()
  const result = await verifyJwt(token)
  console.log('[timing] jwks verify:', Date.now() - jwksStart, 'ms')
  if (!result) return null

  try {
    await redisWith(redis.setex(key, CACHE_TTL, result))
  } catch {}

  return result
}