'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as api from '@/lib/api'
import type { Task as BackendTask } from '@/types'

export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'stuck' | 'skipped'
export type Priority = 1 | 2 | 3

export interface Task {
  id: string
  title: string
  description?: string
  estimatedMinutes: number
  priority: Priority
  status: TaskStatus
  date: 'Today' | 'Yesterday'
}

// Shown when backend is unreachable — keeps UI functional
const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Design the landing page',            description: "Create a clean and emotional landing page that explains the app's philosophy.", estimatedMinutes: 60, priority: 1, status: 'pending', date: 'Today'     },
  { id: '2', title: 'Write content for features section', description: 'Draft copy for each of the three core feature blocks.',                          estimatedMinutes: 45, priority: 2, status: 'pending', date: 'Today'     },
  { id: '3', title: 'Prepare design system',              description: 'Document all tokens, components, and patterns used across the app.',               estimatedMinutes: 80, priority: 1, status: 'pending', date: 'Today'     },
  { id: '4', title: 'Test the onboarding flow',           description: 'Walk through the full onboarding as a new user and note friction points.',         estimatedMinutes: 30, priority: 2, status: 'pending', date: 'Today'     },
  { id: '5', title: "Plan tomorrow's priorities",         description: 'Spend 20 minutes reflecting on what matters most for tomorrow.',                   estimatedMinutes: 20, priority: 3, status: 'pending', date: 'Today'     },
  { id: '6', title: 'Morning journaling',                 description: 'Write freely for 15 minutes.',                                                     estimatedMinutes: 15, priority: 3, status: 'done',    date: 'Yesterday' },
  { id: '7', title: 'Review design specs',                description: 'Go through the latest Figma file.',                                                estimatedMinutes: 40, priority: 2, status: 'done',    date: 'Yesterday' },
  { id: '8', title: 'Update team on blockers',            description: 'Send a brief Slack message.',                                                      estimatedMinutes: 10, priority: 2, status: 'done',    date: 'Yesterday' },
]

interface TaskContextValue {
  tasks: Task[]
  updateStatus: (id: string, status: TaskStatus) => void
  moveToEnd: (id: string) => void
  todayTasks: Task[]
  doneTodayCount: number
  totalTodayCount: number
  isBackendLive: boolean
}

const TaskContext = createContext<TaskContextValue | null>(null)

function toUITask(t: BackendTask, todayStr: string): Task {
  const isToday = t.scheduled_date === todayStr
  return {
    id:                t.id,
    title:             t.title,
    description:       t.description,
    estimatedMinutes:  t.estimated_minutes,
    priority:          t.priority as Priority,
    status:            t.status as TaskStatus,
    date:              isToday ? 'Today' : 'Yesterday',
  }
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks]               = useState<Task[]>(MOCK_TASKS)
  const [isBackendLive, setBackendLive] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const todayStr    = new Date().toISOString().split('T')[0]
        const yesterStr   = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const [todayData, yesterData] = await Promise.all([
          api.getTasks(todayStr),
          api.getTasks(yesterStr).catch(() => [] as BackendTask[]),
        ])
        const all: Task[] = [
          ...todayData.map(t => toUITask(t, todayStr)),
          ...yesterData.map(t => toUITask(t, todayStr)),
        ]
        setTasks(all)
        setBackendLive(true)
      } catch {
        // Backend offline or user not authed — keep mock data, no error shown
        setBackendLive(false)
      }
    }
    load()
  }, [])

  const updateStatus = useCallback((id: string, status: TaskStatus) => {
    // Always update local state immediately
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))

    // Fire-and-forget backend sync — don't block UI or revert on failure
    if (isBackendLive) {
      api.updateTask(id, { status }).catch(console.error)
      if (status === 'done' || status === 'stuck') {
        api.createCheckin({
          task_id: id,
          status: status === 'done' ? 'done' : 'stuck',
        }).catch(console.error)
      }
    }
  }, [isBackendLive])

  const moveToEnd = useCallback((id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id)
      if (!task) return prev
      return [...prev.filter(t => t.id !== id), task]
    })
  }, [])

  const todayTasks     = tasks.filter(t => t.date === 'Today')
  const doneTodayCount = todayTasks.filter(t => t.status === 'done').length
  const totalTodayCount = todayTasks.length

  return (
    <TaskContext.Provider value={{ tasks, updateStatus, moveToEnd, todayTasks, doneTodayCount, totalTodayCount, isBackendLive }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used inside TaskProvider')
  return ctx
}