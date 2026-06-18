import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { rateLimiter } from '@/lib/ratelimit'
import { optionsResponse, json } from '@/lib/cors'
import { getUserPlan } from '@/lib/getUserPlan'
import { getClientIp } from '@/lib/getClientIp'

export async function OPTIONS(request) { return optionsResponse(request) }

export async function GET(request) {
  try {
    const ip = getClientIp(request)
    const { success } = await rateLimiter.limit(ip)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const plan = await getUserPlan(user.id)
    if (!plan.isPro) return json({ error: 'Pro subscription required' }, { status: 403 }, request)

    const { searchParams } = new URL(request.url)
    const from    = searchParams.get('from')
    const to      = searchParams.get('to')
    const groupBy = searchParams.get('groupBy') ?? 'day' // 'day' | 'month'

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!from || !dateRegex.test(from)) return json({ error: 'Invalid from date' }, { status: 400 }, request)
    if (!to   || !dateRegex.test(to))   return json({ error: 'Invalid to date' },   { status: 400 }, request)

    const MAX_RANGE_DAYS = 400
    const rangeDays = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)
    if (rangeDays < 0 || rangeDays > MAX_RANGE_DAYS) {
      return json({ error: 'Date range too large' }, { status: 400 }, request)
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status, scheduled_date')
      .eq('user_id', user.id)
      .gte('scheduled_date', from)
      .lte('scheduled_date', to)

    if (error) return json({ error: error.message }, { status: 500 }, request)

    const buckets = {}
    for (const task of tasks) {
      const key = groupBy === 'month'
        ? task.scheduled_date.slice(0, 7)  // 'YYYY-MM'
        : task.scheduled_date              // 'YYYY-MM-DD'
      if (!buckets[key]) buckets[key] = { period: key, total: 0, done: 0, stuck: 0, skipped: 0 }
      buckets[key].total++
      if (task.status === 'done')    buckets[key].done++
      if (task.status === 'stuck')   buckets[key].stuck++
      if (task.status === 'skipped') buckets[key].skipped++
    }

    const data = Object.values(buckets)
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(b => ({
        ...b,
        momentum_score: b.total > 0 ? Math.round((b.done / b.total) * 100) : 0,
      }))

    return json({ data }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}