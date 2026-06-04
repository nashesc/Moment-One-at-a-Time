'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
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

export interface NewTaskPayload {
  title: string
  description?: string
  priority: Priority
  estimatedMinutes: number
}

interface TaskContextValue {
  tasks: Task[]
  loading: boolean
  error: string | null
  updateStatus: (id: string, status: TaskStatus) => void
  moveToEnd: (id: string) => void
  addTask: (payload: NewTaskPayload) => Promise<void>
  todayTasks: Task[]
  doneTodayCount: number
  totalTodayCount: number
  refresh: () => Promise<void>
}

const TaskContext = createContext<TaskContextValue | null>(null)

function toUITask(t: BackendTask, todayStr: string): Task {
  return {
    id:               t.id,
    title:            t.title,
    description:      t.description,
    estimatedMinutes: t.estimated_minutes,
    priority:         t.priority as Priority,
    status:           t.status as TaskStatus,
    date:             t.scheduled_date === todayStr ? 'Today' : 'Yesterday',
  }
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks]     = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const todayStr              = useRef(new Date().toISOString().split('T')[0])

  const load = useCallback(async () => {
    // Check session first — don't fire API calls if not authenticated
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const today  = todayStr.current
      const yester = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

      // 2 API calls total — today + yesterday
      const [todayData, yesterData] = await Promise.all([
        api.getTasks(today),
        api.getTasks(yester).catch(() => [] as BackendTask[]),
      ])

      setTasks([
        ...todayData.map(t  => toUITask(t, today)),
        ...yesterData.map(t => toUITask(t, today)),
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      // 401 = not authed, silently ignore
      if (!msg.includes('401')) {
        setError('Could not load tasks. Please check your connection.')
      }
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    if (id.startsWith('temp-')) return
    api.updateTask(id, { status }).catch(console.error)

    if (status === 'done' || status === 'stuck') {
      api.createCheckin({
        task_id: id,
        status: status === 'done' ? 'done' : 'stuck',
      }).catch(console.error)
    }
  }, [])

  const moveToEnd = useCallback((id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id)
      if (!task) return prev
      return [...prev.filter(t => t.id !== id), task]
    })
  }, [])

  const addTask = useCallback(async (payload: NewTaskPayload) => {
    const today  = todayStr.current
    const tempId = `temp-${Date.now()}`
    const newTask: Task = {
      id:               tempId,
      title:            payload.title,
      description:      payload.description,
      estimatedMinutes: payload.estimatedMinutes,
      priority:         payload.priority,
      status:           'pending',
      date:             'Today',
    }
    setTasks(prev => [...prev, newTask])
    try {
      const created = await api.createTask({
        title:             payload.title,
        description:       payload.description,
        priority:          payload.priority,
        estimated_minutes: payload.estimatedMinutes,
        scheduled_date:    today,
      })
      setTasks(prev => prev.map(t => t.id === tempId ? toUITask(created, today) : t))
    } catch (err) {
      setTasks(prev => prev.filter(t => t.id !== tempId))
      throw err
    }
  }, [])

  const todayTasks      = tasks.filter(t => t.date === 'Today')
  const doneTodayCount  = todayTasks.filter(t => t.status === 'done').length
  const totalTodayCount = todayTasks.length

  return (
    <TaskContext.Provider value={{
      tasks, loading, error,
      updateStatus, moveToEnd, addTask, refresh: load,
      todayTasks, doneTodayCount, totalTodayCount,
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used inside TaskProvider')
  return ctx
}