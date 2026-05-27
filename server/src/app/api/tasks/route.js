import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser, unauthorized, badRequest, serverError } from '@/lib/auth'
import { rateLimiter } from '@/lib/ratelimit'
import { taskSchema } from '@/lib/validations'

export async function GET(request) {
  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    // Auth check
    const user = await getUser()
    if (!user) return unauthorized()

    // Get date filter from query params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Query
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('scheduled_date', date)
      .order('order_index', { ascending: true })

    if (error) return serverError(error.message)

    return NextResponse.json({ data })
  } catch (err) {
    return serverError()
  }
}

export async function POST(request) {
  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    // Auth check
    const user = await getUser()
    if (!user) return unauthorized()

    // Validate body
    const body = await request.json()
    const parsed = taskSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.errors[0].message)

    // Insert
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single()

    if (error) return serverError(error.message)

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return serverError()
  }
}