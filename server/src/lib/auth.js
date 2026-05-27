import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function getUser() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export function unauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}

export function badRequest(message) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  )
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
}