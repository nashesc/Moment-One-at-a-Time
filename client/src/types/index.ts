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
  order_index: number
  created_at: string
  updated_at: string
}

export interface Checkin {
  id: string
  user_id: string
  task_id: string
  status: 'on_track' | 'stuck' | 'skipped' | 'done'
  stuck_reason?: string
  notes?: string
  checked_at: string
  task_title?: string
}

export interface Recap {
  id: string
  user_id: string
  recap_date: string
  tasks_total: number
  tasks_done: number
  tasks_stuck: number
  tasks_skipped: number
  momentum_score: number
}

export interface Profile {
  id: string
  full_name?: string
  email?: string
  avatar_url?: string
  created_at: string
}

export interface PushSubscriptionJSON {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}