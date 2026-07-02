export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'stuck' | 'skipped'
export type TaskPriority = 1 | 2 | 3

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  scheduled_date: string
  estimated_minutes: number
  actual_minutes?: number
  order_index: number
  created_at: string
  updated_at: string
}

export interface RouteContext<P extends Record<string, string> = { id: string }> {
  params: Promise<P>
}