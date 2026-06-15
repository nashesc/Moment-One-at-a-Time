import { createClient } from './supabase/client'
import type { Task, Checkin, Recap, PushSubscriptionJSON, TaskPriority } from '@/types'

// In-memory cache — prevents redundant fetches within the same session
const _recapCache  = new Map<string, { data: Recap; ts: number }>()
let _checkinsCache: { data: Checkin[]; ts: number } | null = null

let _currentUserId: string | null = null

export function setCurrentUser(userId: string | null) {
  if (_currentUserId !== userId) {
    _recapCache.clear()
    _checkinsCache = null
  }
  _currentUserId = userId
}

export function clearApiCache() {
  _recapCache.clear()
  _checkinsCache = null
  _currentUserId = null
}
export function clearRecapCacheForDate(date: string) {
  _recapCache.delete(date)
}


const RECAP_TTL    = 5 * 60 * 1000  // 5 min
const CHECKINS_TTL = 2 * 60 * 1000  // 2 min

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:4000'

async function getToken(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token ?? null
    return token
  } catch (err) {
    console.error('[API] Failed to get auth token:', err)
    return null
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
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

  // Backend always returns { data: T } — unwrap it
  const json = await res.json()
  // Only fall back to raw json if 'data' key is genuinely absent
  return (Object.prototype.hasOwnProperty.call(json, 'data') ? json.data : json) as T
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
  _checkinsCache = null
  return apiFetch<Checkin>('/api/checkins', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Backend returns checkins with nested tasks(title) — flatten to task_title
export async function getCheckins(): Promise<Checkin[]> {
  if (_checkinsCache && Date.now() - _checkinsCache.ts < CHECKINS_TTL) {
    return _checkinsCache.data
  }
  const raw = await apiFetch<Array<Checkin & { tasks?: { title: string } }>>('/api/checkins')
  const data = raw.map(c => ({
    ...c,
    task_title: c.task_title ?? c.tasks?.title ?? '',
    tasks: undefined,
  }))
  _checkinsCache = { data, ts: Date.now() }
  return data
}

export function getRecap(date?: string): Promise<Recap> {
  const key = date ?? new Date().toISOString().split('T')[0]
  const hit = _recapCache.get(key)
  if (hit && Date.now() - hit.ts < RECAP_TTL) return Promise.resolve(hit.data)
  const q = date ? `?date=${date}` : ''
  return apiFetch<Recap>(`/api/recap${q}`).then(data => {
    _recapCache.set(key, { data, ts: Date.now() })
    return data
  })
}

export interface RecapRangeItem {
  period: string  // 'YYYY-MM-DD' or 'YYYY-MM'
  total: number
  done: number
  stuck: number
  skipped: number
  momentum_score: number
}

export function getRecapRange(
  from: string,
  to: string,
  groupBy: 'day' | 'month'
): Promise<RecapRangeItem[]> {
  return apiFetch<RecapRangeItem[]>(
    `/api/recap/range?from=${from}&to=${to}&groupBy=${groupBy}`
  )
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