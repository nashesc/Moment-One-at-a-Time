import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { rateLimiter, writeLimiter } from '@/lib/ratelimit'
import { checkinSchema } from '@/lib/validations'
import { optionsResponse, json } from '@/lib/cors'
import { getUserPlan } from '@/lib/getUserPlan'
import { getClientIp } from '@/lib/getClientIp'

export async function OPTIONS(request) { return optionsResponse(request) }

export async function POST(request) {
  try {
    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const { success } = await writeLimiter.limit(`user:${user.id}`)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const body = await request.json()
    const parsed = checkinSchema.safeParse(body)
    if (!parsed.success) return json({ error: parsed.error.issues[0].message }, { status: 400 }, request)

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', parsed.data.task_id)
      .eq('user_id', user.id)
      .single()

    if (!task) return json({ error: 'Task not found' }, { status: 400 }, request)

    const { data, error } = await supabase
      .from('checkins')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single()

    if (error) return json({ error: error.message }, { status: 500 }, request)

    const statusMap = { done: 'done', stuck: 'stuck', skipped: 'skipped' }
    await supabase
      .from('tasks')
      .update({
        status: statusMap[parsed.data.status] ?? 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', parsed.data.task_id)
      .eq('user_id', user.id)

    // Read-then-write, not atomic — acceptable here since checkins for one
    // task realistically only come from one device/tab at a time for this
    // app's usage pattern. Revisit with an RPC if that assumption breaks.
    if (parsed.data.duration_seconds) {
      const { data: task } = await supabase
        .from('tasks')
        .select('actual_minutes')
        .eq('id', parsed.data.task_id)
        .eq('user_id', user.id)
        .single()
      const addedMinutes = Math.round(parsed.data.duration_seconds / 60)
      await supabase
        .from('tasks')
        .update({ actual_minutes: (task?.actual_minutes ?? 0) + addedMinutes })
        .eq('id', parsed.data.task_id)
        .eq('user_id', user.id)
    }

    return json({ data }, { status: 201 }, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}

export async function GET(request) {
  try {
    const ip = getClientIp(request)
    const { success } = await rateLimiter.limit(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const plan = await getUserPlan(user.id)
    const limit = plan.isPro ? 50 : 15

    const { data, error } = await supabase
      .from('checkins')
      .select('*, tasks(title)')
      .eq('user_id', user.id)
      .order('checked_at', { ascending: false })
      .limit(limit)

    if (error) return json({ error: error.message }, { status: 500 }, request)
    return json({ data }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}