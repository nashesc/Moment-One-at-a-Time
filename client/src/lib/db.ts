import Dexie, { type Table } from 'dexie'
import type { Task, Checkin, Recap } from '@/types'

class MomentDB extends Dexie {
  tasks!: Table<Task>
  checkins!: Table<Checkin>
  recaps!: Table<Recap>

  constructor() {
    super('MomentDB')
    this.version(1).stores({
      tasks: 'id, user_id, scheduled_date, status',
      checkins: 'id, user_id, task_id, checked_at',
      recaps: 'id, user_id, recap_date',
    })
  }
}

export const db = new MomentDB()