import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getUser, unauthorized, badRequest, serverError, notFound, logError } from '@/lib/auth'
import { rateLimiter } from '@/lib/ratelimit'
import { updateTaskSchema } from '@/lib/validations'

// Validate UUID format
function isValidUUID(id) {
  try {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  } catch {
    return false
  }
}

export async function PATCH(request, context) {
  const { id } = await context.params

  // Validate UUID format
  if (!isValidUUID(id)) return badRequest('Invalid task ID format')

  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const user = await getUser(request)
    if (!user) return unauthorized()

    const body = await request.json()
    const parsed = updateTaskSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    // First verify task exists AND belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingTask) {
      return notFound()
    }

    // Now update
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logError('PATCH /api/tasks/[id]', error)
      return serverError('Failed to update task', error)
    }

    return NextResponse.json({ data })
  } catch (err) {
    logError('PATCH /api/tasks/[id] [CATCH]', err)
    return serverError('Failed to update task', err)
  }
}

export async function DELETE(request, context) {
  const { id } = await context.params

  // Validate UUID format
  if (!isValidUUID(id)) return badRequest('Invalid task ID format')

  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const user = await getUser(request)
    if (!user) return unauthorized()

    // First verify task exists AND belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingTask) {
      return notFound()
    }

    // Now delete
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logError('DELETE /api/tasks/[id]', error)
      return serverError('Failed to delete task', error)
    }

    return NextResponse.json({ message: 'Task deleted' })
  } catch (err) {
    logError('DELETE /api/tasks/[id] [CATCH]', err)
    return serverError('Failed to delete task', err)
  }
}