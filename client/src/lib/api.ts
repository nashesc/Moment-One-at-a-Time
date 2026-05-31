import { createClient } from './supabase/client'
import type { Task, TaskPriority, Checkin, Recap } from '@/types'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001'

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${SERVER_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}

export function getTasks(date?: string): Promise<Task[]> {
  const q = date ? `?date=${date}` : ''
  return apiFetch<Task[]>(`/api/tasks${q}`)
}

export function createTask(payload: {
  title: string
  description?: string
  priority: TaskPriority
  scheduled_date: string
  estimated_minutes: number
}): Promise<Task> {
  return apiFetch<Task>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTask(
  id: string,
  payload: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'estimated_minutes' | 'order_index'>>
): Promise<Task> {
  return apiFetch<Task>(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteTask(id: string): Promise<{ message: string }> {
  return apiFetch(`/api/tasks/${id}`, { method: 'DELETE' })
}

export function createCheckin(payload: {
  task_id: string
  status: 'on_track' | 'stuck' | 'skipped' | 'done'
  stuck_reason?: string
  notes?: string
}): Promise<Checkin> {
  return apiFetch<Checkin>('/api/checkins', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCheckins(): Promise<Checkin[]> {
  return apiFetch<Checkin[]>('/api/checkins')
}

export function getRecap(date?: string): Promise<Recap> {
  const q = date ? `?date=${date}` : ''
  return apiFetch<Recap>(`/api/recap${q}`)
}

export function savePushSubscription(subscription: PushSubscriptionJSON): Promise<{ message: string }> {
  return apiFetch('/api/push', {
    method: 'POST',
    body: JSON.stringify({ subscription }),
  })
}

export function sendTestPush(): Promise<{ message: string }> {
  return apiFetch('/api/push')
}