import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getUser, unauthorized, badRequest, serverError } from '@/lib/auth'
import { rateLimiter, authRateLimiter } from '@/lib/ratelimit'
import { checkinSchema } from '@/lib/validations'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await authRateLimiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const user = await getUser(request)
    if (!user) return unauthorized()

    const body = await request.json()
    const parsed = checkinSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', parsed.data.task_id)
      .eq('user_id', user.id)
      .single()

    if (!task) return badRequest('Task not found')
      
    // Save checkin
    const { data, error } = await supabase
      .from('checkins')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single()

    if (error) return serverError(error.message)

    // Update task status too
    await supabase
      .from('tasks')
      .update({
        status: parsed.data.status === 'done' ? 'done' :
                parsed.data.status === 'stuck' ? 'stuck' : 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', parsed.data.task_id)
      .eq('user_id', user.id)

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return serverError()
  }
}

export async function GET(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const user = await getUser(request)
    if (!user) return unauthorized()

    const { data, error } = await supabase
      .from('checkins')
      .select('*, tasks(title)')
      .eq('user_id', user.id)
      .order('checked_at', { ascending: false })
      .limit(20)

    if (error) return serverError(error.message)

    return NextResponse.json({ data })
  } catch (err) {
    return serverError()
  }
}