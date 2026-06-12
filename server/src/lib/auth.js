import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// AFTER — remove the cache entirely, it does nothing on Vercel serverless
export async function getUser(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !parts[1]) return null

    const { data: { user }, error } = await supabase.auth.getUser(parts[1])
    if (error || !user) return null
    return user
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