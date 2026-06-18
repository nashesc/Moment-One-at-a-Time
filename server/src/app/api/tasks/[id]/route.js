import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { writeLimiter } from '@/lib/ratelimit'
import { updateTaskSchema } from '@/lib/validations'
import { optionsResponse, json } from '@/lib/cors'

export async function OPTIONS(request) { return optionsResponse(request) }

export async function PATCH(request, context) {
  const { id } = await context.params
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) return json({ error: 'Invalid task ID' }, { status: 400 }, request)

  try {
    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const { success } = await writeLimiter.limit(`user:${user.id}`)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const body = await request.json()
    const parsed = updateTaskSchema.safeParse(body)
    if (!parsed.success) return json({ error: parsed.error.issues[0].message }, { status: 400 }, request)

    const { data, error } = await supabase
      .from('tasks')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id).eq('user_id', user.id).select().single()

    if (error) return json({ error: error.message }, { status: 500 }, request)
    return json({ data }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}

export async function DELETE(request, context) {
  const { id } = await context.params
  try {
    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const { success } = await writeLimiter.limit(`user:${user.id}`)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id)
    if (error) return json({ error: error.message }, { status: 500 }, request)
    return json({ message: 'Task deleted' }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}