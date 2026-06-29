import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Module-level — created once per edge isolate, reused across requests
const supabaseVerifier = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CACHE_TTL = 60 // seconds — revoked tokens detected within this window

async function getVerifiedUser(token: string): Promise<{ id: string; email: string } | null> {
  const key = `mw:auth:${token.slice(0, 16)}`

  // Cache hit — skip Supabase Auth network call entirely
  try {
    const cached = await redis.get<{ id: string; email: string }>(key)
    if (cached) return cached
  } catch {
    // Redis down — fall through to direct verification
  }

  // Cache miss — verify with Supabase Auth server
  const { data: { user }, error } = await supabaseVerifier.auth.getUser(token)
  if (error || !user) return null

  // Only cache valid results — revoked/invalid tokens are never cached
  // so they keep hitting Supabase Auth until the cookie is cleared
  const result = { id: user.id, email: user.email ?? '' }
  try {
    await redis.setex(key, CACHE_TTL, result)
  } catch {
    // Redis down — continue without caching
  }

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