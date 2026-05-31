import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getUser, unauthorized, badRequest, serverError } from '@/lib/auth'
import { rateLimiter } from '@/lib/ratelimit'
import { updateTaskSchema } from '@/lib/validations'

export async function PATCH(request, context) {
  const { id } = await context.params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) return badRequest('Invalid task ID')

  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const user = await getUser(request)
    if (!user) return unauthorized()

    const body = await request.json()
    const parsed = updateTaskSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { data, error } = await supabase
      .from('tasks')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return serverError(error.message)

    return NextResponse.json({ data })
  } catch (err) {
    return serverError()
  }
}

export async function DELETE(request, context) {
  const { id } = await context.params

  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const user = await getUser(request)
    if (!user) return unauthorized()

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return serverError(error.message)

    return NextResponse.json({ message: 'Task deleted' })
  } catch (err) {
    return serverError()
  }
}