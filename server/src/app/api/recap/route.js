import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser, unauthorized, serverError } from '@/lib/auth'
import { rateLimiter } from '@/lib/ratelimit'

export async function GET(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const user = await getUser()
    if (!user) return unauthorized()

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const supabase = await createClient()

    // Get all tasks for the day
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('scheduled_date', date)

    if (error) return serverError(error.message)

    // Calculate recap
    const total = tasks.length
    const done = tasks.filter(t => t.status === 'done').length
    const stuck = tasks.filter(t => t.status === 'stuck').length
    const skipped = tasks.filter(t => t.status === 'skipped').length
    const momentum_score = total > 0 ? Math.round((done / total) * 100) : 0

    // Upsert recap
    const { data: recap, error: recapError } = await supabase
      .from('recaps')
      .upsert({
        user_id: user.id,
        recap_date: date,
        tasks_total: total,
        tasks_done: done,
        tasks_stuck: stuck,
        tasks_skipped: skipped,
        momentum_score,
      }, { onConflict: 'user_id, recap_date' })
      .select()
      .single()

    if (recapError) return serverError(recapError.message)

    return NextResponse.json({ data: recap })
  } catch (err) {
    return serverError()
  }
}