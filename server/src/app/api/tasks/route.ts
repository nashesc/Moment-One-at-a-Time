import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { limitStandard, limitWrite} from '@/lib/ratelimit'
import { getUserPlan } from '@/lib/getUserPlan'
import { taskSchema } from '@/lib/validations'
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

    const plan = await getUserPlan(user.id)
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (!plan.isPro && date !== today && date !== yesterdayStr) {
      return json({ error: 'Task history requires Pro' }, { status: 403 }, request)
    }

    const TASK_FETCH_LIMIT = 200

    const { data, error, count } = await supabase
      .from('tasks')
      .select('id, title, description, status, priority, scheduled_date, estimated_minutes, order_index, created_at, updated_at', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('scheduled_date', date)
      .order('order_index', { ascending: true })
      .limit(TASK_FETCH_LIMIT)

    if (error) return json({ error: error.message }, { status: 500 }, request)
    const truncated = (count ?? data.length) > data.length
    return json({ data, meta: { truncated, total: count } }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const { success } = await limitWrite(`user:${user.id}`)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const body: unknown = await request.json()
    const parsed = taskSchema.safeParse(body)
    if (!parsed.success) return json({ error: parsed.error.issues[0].message }, { status: 400 }, request)

    const plan = await getUserPlan(user.id)
    if (!plan.isPro) {
      const taskDate = parsed.data.scheduled_date || new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('scheduled_date', taskDate)
      if ((count ?? 0) >= 7) {
        return json({ error: 'Free plan is limited to 7 tasks per day' }, { status: 403 }, request)
      }
    }

    const { data: existing } = await supabase
      .from('tasks')
      .select('order_index')
      .eq('user_id', user.id)
      .eq('scheduled_date', parsed.data.scheduled_date || new Date().toISOString().split('T')[0])
      .order('order_index', { ascending: false })
      .limit(1)

    const nextIndex = (existing?.[0]?.order_index ?? -1) + 1

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...parsed.data, user_id: user.id, order_index: nextIndex })
      .select()
      .single()

    if (error) return json({ error: error.message }, { status: 500 }, request)
    return json({ data }, { status: 201 }, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}