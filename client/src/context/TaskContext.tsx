'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import * as api from '@/lib/api'
import { clearApiCache, setCurrentUser, clearRecapCacheForDate } from '@/lib/api'
import { db } from '@/lib/db'
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
  isOffline: boolean
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
  const [tasks, setTasks]       = useState<Task[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const todayStr                = useRef(new Date().toISOString().split('T')[0])
  const loadedUserIdRef         = useRef<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setTasks([])
      setLoading(false)
      loadedUserIdRef.current = null
      return
    }

    // Different user logged in — clear stale cached data
    if (loadedUserIdRef.current && loadedUserIdRef.current !== session.user.id) {
      setTasks([])
      clearApiCache()
      setCurrentUser(null)
      db.tasks.clear().catch(() => {})
      db.syncQueue.clear().catch(() => {})
    }

    setLoading(true)
    setError(null)
    const today  = todayStr.current
    const yester = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

    try {
      const [todayData, yesterData] = await Promise.all([
        api.getTasks(today),
        api.getTasks(yester).catch(() => [] as BackendTask[]),
      ])

      // Write to Dexie for offline access
      db.tasks.bulkPut([...todayData, ...yesterData]).catch(() => {})

      loadedUserIdRef.current = session.user.id
      setIsOffline(false)
      setTasks([
        ...todayData.map(t  => toUITask(t, today)),
        ...yesterData.map(t => toUITask(t, today)),
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('401')) {
        console.warn('[Tasks] Session expired, redirecting to login')
        window.location.href = '/login'
        return
      }

      // Network failure — try Dexie fallback
      try {
        const [offlineToday, offlineYester] = await Promise.all([
          db.tasks.where('scheduled_date').equals(today).toArray(),
          db.tasks.where('scheduled_date').equals(yester).toArray(),
        ])

        if (offlineToday.length || offlineYester.length) {
          loadedUserIdRef.current = session.user.id
          setIsOffline(true)
          setTasks([
            ...offlineToday.map(t => toUITask(t, today)),
            ...offlineYester.map(t => toUITask(t, today)),
          ])
        } else {
          setIsOffline(true)
          setError('No connection and no cached data available.')
          setTasks([])
        }
      } catch {
        setError('Could not load tasks. Please check your connection.')
        setTasks([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Flush any mutations that were queued while offline
  const flushSyncQueue = useCallback(async () => {
    const items = await db.syncQueue.orderBy('createdAt').toArray().catch(() => [])
    for (const item of items) {
      try {
        if (item.type === 'updateTask') {
          const { id, updates } = item.payload as { id: string; updates: Parameters<typeof api.updateTask>[1] }
          if (!id.startsWith('temp-')) {
            await api.updateTask(id, updates)
          }
        } else if (item.type === 'createCheckin') {
          await api.createCheckin(item.payload as Parameters<typeof api.createCheckin>[0])
        } else if (item.type === 'createTask') {
          const { tempId, title, description, priority, estimated_minutes, scheduled_date } = item.payload as {
            tempId: string; title: string; description?: string
            priority: Priority; estimated_minutes: number; scheduled_date: string
          }
          const created = await api.createTask({ title, description, priority, estimated_minutes, scheduled_date })
          // Replace temp in Dexie with real task
          db.tasks.delete(tempId).catch(() => {})
          db.tasks.put(created).catch(() => {})
        }
        if (item.id !== undefined) await db.syncQueue.delete(item.id).catch(() => {})
      } catch {
        if (item.id !== undefined) {
          item.retries >= 3
            ? db.syncQueue.delete(item.id).catch(() => {})
            : db.syncQueue.update(item.id, { retries: item.retries + 1 }).catch(() => {})
        }
      }
    }
  }, [])

  useEffect(() => {
    load()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return
      if (event === 'SIGNED_OUT') {
        setTasks([])
        setError(null)
        setLoading(false)
        setIsOffline(false)
        loadedUserIdRef.current = null
        clearApiCache()
        setCurrentUser(null)
        db.tasks.clear().catch(() => {})
        db.syncQueue.clear().catch(() => {})
      } else if (event === 'SIGNED_IN') {
        const incomingUserId = session?.user?.id ?? null
        if (incomingUserId && incomingUserId !== loadedUserIdRef.current) {
          setTasks([])
          setError(null)
          clearApiCache()
          load()
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [load])

  // Re-sync and reload when connection is restored
  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false)
      await flushSyncQueue()
      await load()
    }
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [flushSyncQueue, load])

  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const newDate = new Date().toISOString().split('T')[0]
      if (newDate !== todayStr.current) {
        todayStr.current = newDate
        load()
      }
    }, 60_000)

    return () => clearInterval(checkMidnight)
  }, [load])

  const tasksRef = useRef<Task[]>([])
  useEffect(() => { tasksRef.current = tasks }, [tasks])

  const updateStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    if (id.startsWith('temp-')) return

    // Always update Dexie so offline reads stay current
    db.tasks.update(id, { status, updated_at: new Date().toISOString() }).catch(() => {})
    clearRecapCacheForDate(todayStr.current)

    if (navigator.onLine) {
      api.updateTask(id, { status }).catch(console.error)
      if (status === 'done' || status === 'stuck') {
        const task = tasksRef.current.find(t => t.id === id)
        api.createCheckin({
          task_id: id,
          status: status === 'done' ? 'done' : 'stuck',
          ...(task?.description ? { notes: task.description } : {}),
        }).catch(console.error)
      }
    } else {
      // Queue for sync when back online
      db.syncQueue.add({
        type: 'updateTask',
        payload: { id, updates: { status } },
        createdAt: Date.now(),
        retries: 0,
      }).catch(() => {})
      if (status === 'done' || status === 'stuck') {
        const task = tasksRef.current.find(t => t.id === id)
        db.syncQueue.add({
          type: 'createCheckin',
          payload: {
            task_id: id,
            status: status === 'done' ? 'done' : 'stuck',
            ...(task?.description ? { notes: task.description } : {}),
          },
          createdAt: Date.now(),
          retries: 0,
        }).catch(() => {})
      }
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
      db.tasks.delete(tempId).catch(() => {})
      db.tasks.put(created).catch(() => {})
    } catch (err) {
      if (!navigator.onLine) {
        // Keep temp task — persist to Dexie and queue creation for later
        db.tasks.put({
          id:                tempId,
          user_id:           loadedUserIdRef.current || '',
          title:             payload.title,
          description:       payload.description,
          status:            'pending',
          priority:          payload.priority,
          scheduled_date:    today,
          estimated_minutes: payload.estimatedMinutes,
          order_index:       9999,
          created_at:        new Date().toISOString(),
          updated_at:        new Date().toISOString(),
        }).catch(() => {})
        db.syncQueue.add({
          type: 'createTask',
          payload: {
            tempId,
            title:             payload.title,
            description:       payload.description,
            priority:          payload.priority,
            estimated_minutes: payload.estimatedMinutes,
            scheduled_date:    today,
          },
          createdAt: Date.now(),
          retries: 0,
        }).catch(() => {})
      } else {
        setTasks(prev => prev.filter(t => t.id !== tempId))
        throw err
      }
    }
  }, [])

  const todayTasks      = tasks.filter(t => t.date === 'Today')
  const doneTodayCount  = todayTasks.filter(t => t.status === 'done').length
  const totalTodayCount = todayTasks.length

  return (
    <TaskContext.Provider value={{
      tasks, loading, error, isOffline,
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