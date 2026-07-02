import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { limitWrite } from '@/lib/ratelimit'
import { updateTaskSchema } from '@/lib/validations'
import { optionsResponse, json } from '@/lib/cors'
import type { RouteContext } from '@/types'

export async function OPTIONS(request: NextRequest) { return optionsResponse(request) }

export async function PATCH(request: NextRequest, context: RouteContext<{ id: string }>) {
  const { id } = await context.params
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) return json({ error: 'Invalid task ID' }, { status: 400 }, request)

  try {
    const user = await getUser(request)
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 }, request)

    const { success } = await limitWrite(`user:${user.id}`)
    if (!success) return json({ error: 'Too many requests' }, { status: 429 }, request)

    const body: unknown = await request.json()
    const parsed = updateTaskSchema.safeParse(body)
    if (!parsed.success) return json({ error: parsed.error.issues[0].message }, { status: 400 }, request)

    const { data, error } = await supabase
      .from('tasks').update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id).eq('user_id', user.id).select().single()

    if (error) return json({ error: error.message }, { status: 500 }, request)
    return json({ data }, {}, request)
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 }, request)
  }
}