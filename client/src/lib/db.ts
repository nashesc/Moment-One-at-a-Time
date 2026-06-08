import Dexie, { type Table } from 'dexie'
import type { Task, Checkin, Recap } from '@/types'

export interface SyncQueueItem {
  id?: number  // auto-increment
  type: 'updateTask' | 'createTask' | 'createCheckin'
  payload: Record<string, unknown>
  createdAt: number
  retries: number
}

class MomentDB extends Dexie {
  tasks!: Table<Task>
  checkins!: Table<Checkin>
  recaps!: Table<Recap>
  syncQueue!: Table<SyncQueueItem>

  constructor() {
    super('MomentDB')
    this.version(1).stores({
      tasks: 'id, user_id, scheduled_date, status',
      checkins: 'id, user_id, task_id, checked_at',
      recaps: 'id, user_id, recap_date',
    })
    // Version 2: adds syncQueue for offline mutation queuing
    this.version(2).stores({
      tasks: 'id, user_id, scheduled_date, status',
      checkins: 'id, user_id, task_id, checked_at',
      recaps: 'id, user_id, recap_date',
      syncQueue: '++id, type, createdAt',
    })
  }
}

export const db = new MomentDB()