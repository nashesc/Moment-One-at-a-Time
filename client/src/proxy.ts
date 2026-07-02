import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import * as jose from 'jose'
import { createHash } from 'crypto'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const CACHE_TTL = 60
const REDIS_TIMEOUT_MS = 400

// Supabase rotated to ECC (P-256) signing keys — static HS256 secret no
// longer verifies current tokens. JWKS fetches the active key set and
// handles future rotations without a redeploy.
const JWKS = jose.createRemoteJWKSet(
  new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
)

function redisWith<T>(op: Promise<T>): Promise<T> {
  return Promise.race([
    op,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Redis timeout')), REDIS_TIMEOUT_MS)
    ),
  ])
}

async function verifyJwtLocally(token: string): Promise<{ id: string; email: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWKS)
    if (!payload.sub) return null
    return { id: payload.sub, email: (payload.email as string) ?? '' }
  } catch {
    return null
  }
}

async function getVerifiedUser(token: string): Promise<{ id: string; email: string } | null> {
  const key = `mw:auth:${createHash('sha256').update(token).digest('hex')}`

  try {
    const cached = await redisWith(redis.get<{ id: string; email: string }>(key))
    if (cached) { console.log('[mw] cache hit'); return cached }
    console.log('[mw] cache miss — verifying locally')

  } catch {
    // Redis slow/down — fall through to local verification
  }

  // Local JWT verification — ~1ms, no network
  const result = await verifyJwtLocally(token)
  if (!result) return null

  try {
    await redisWith(redis.setex(key, CACHE_TTL, result))
  } catch {}

  return result
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getSession() is local — reads cookie, refreshes token only if actually
  // expired (that refresh is a network call but happens rarely).
  // We use this only to extract the access token, not to trust user identity.
  const { data: { session } } = await supabase.auth.getSession()

  // Identity verification goes through Redis cache first, then Supabase Auth
  const user = session?.access_token
    ? await getVerifiedUser(session.access_token)
    : null

  const { pathname } = request.nextUrl
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isPublicRoute = isAuthRoute
    || pathname === '/'
    || pathname.startsWith('/terms')
    || pathname.startsWith('/privacy')
    || pathname.startsWith('/refund')
    || pathname.startsWith('/upgrade')
    || pathname.startsWith('/splash')
    || pathname.startsWith('/forgot-password')
    || pathname.startsWith('/reset-password')
  const isProtected = !isPublicRoute

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/splash'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}