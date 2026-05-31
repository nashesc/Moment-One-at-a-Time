import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getUser, unauthorized, badRequest, serverError, notFound, logError } from '@/lib/auth'
import { rateLimiter } from '@/lib/ratelimit'
import { checkinSchema } from '@/lib/validations'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const user = await getUser(request)
    if (!user) return unauthorized()

    const body = await request.json()
    const parsed = checkinSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', parsed.data.task_id)
      .eq('user_id', user.id)
      .single()

    if (taskError || !task) {
      return notFound()
    }
       
    const { data, error } = await supabase
      .from('checkins')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single()

    if (error) {
      logError('POST /api/checkins', error)
      return serverError('Failed to create checkin', error)
    }

    const updateError = await supabase
      .from('tasks')
      .update({
        status: parsed.data.status === 'done' ? 'done' :
                parsed.data.status === 'stuck' ? 'stuck' : 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', parsed.data.task_id)
      .eq('user_id', user.id)

    if (updateError.error) {
      logError('POST /api/checkins [UPDATE_TASK]', updateError.error)
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    logError('POST /api/checkins [CATCH]', err)
    return serverError('Failed to create checkin', err)
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

    if (error) {
      logError('GET /api/checkins', error)
      return serverError('Failed to fetch checkins', error)
    }

    return NextResponse.json({ data })
  } catch (err) {
    logError('GET /api/checkins [CATCH]', err)
    return serverError('Failed to fetch checkins', err)
  }
}