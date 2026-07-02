import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { limitStandard } from '@/lib/ratelimit'
import { optionsResponse, json } from '@/lib/cors'
import { getClientIp } from '@/lib/getClientIp'
import { NextRequest } from 'next/server'
export async function OPTIONS(request: NextRequest) { return optionsResponse(request) }

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { success } = await limitStandard(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const { searchParams } = new URL(request.url)
    const rawDate = searchParams.get('date')
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (rawDate && !dateRegex.test(rawDate)) return json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 }, request)
    const date = rawDate || new Date().toISOString().split('T')[0]

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status')
      .eq('user_id', user.id)
      .eq('scheduled_date', date)

    if (error) return json({ error: error.message }, { status: 500 }, request)

    const total = tasks.length
    const done = tasks.filter(t => t.status === 'done').length
    const stuck = tasks.filter(t => t.status === 'stuck').length
    const skipped = tasks.filter(t => t.status === 'skipped').length
    const momentum_score = total > 0 ? Math.round((done / total) * 100) : 0

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
      }, { onConflict: 'user_id,recap_date' })
      .select()
      .single()

    if (recapError) return json({ error: recapError.message }, { status: 500 }, request)
    return json({ data: recap }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}