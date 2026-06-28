'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export type TimerMode = 'stopwatch' | 'countdown'

interface PersistedSession {
  mode: TimerMode
  accumulatedSeconds: number
  resumedAt: number | null
  hasOverrun: boolean
  estimatedMinutes: number
  startedDate: string
}

function storageKey(userId: string, taskId: string) {
  return `moment_focus_session_${userId}_${taskId}`
}

function loadSession(userId: string, taskId: string): PersistedSession | null {
  try {
    const raw = localStorage.getItem(storageKey(userId, taskId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveSession(userId: string, taskId: string, session: PersistedSession) {
  try { localStorage.setItem(storageKey(userId, taskId), JSON.stringify(session)) } catch {}
}

function clearSession(userId: string, taskId: string) {
  try { localStorage.removeItem(storageKey(userId, taskId)) } catch {}
}

export function useFocusSession(
  userId: string | null,
  taskId: string,
  estimatedMinutes: number,
  onThresholdCrossed?: () => void
) {
  const [mode, setModeState] = useState<TimerMode>('stopwatch')
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [hasOverrun, setHasOverrun] = useState(false)
  // Target duration is pinned to whatever was active when the session
  // started. A freshly-passed estimatedMinutes prop — e.g. from a
  // re-fetched/re-selected task after navigating away and back — must
  // not silently override an in-progress countdown's target.
  const [sessionEstimatedMinutes, setSessionEstimatedMinutes] = useState(estimatedMinutes)

  const accumulatedRef = useRef(0)
  const resumedAtRef   = useRef<number | null>(null)
  const tickRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedDateRef = useRef<string>(new Date().toISOString().split('T')[0])
  const onCrossedRef   = useRef(onThresholdCrossed)
  useEffect(() => { onCrossedRef.current = onThresholdCrossed }, [onThresholdCrossed])

  const targetSeconds = sessionEstimatedMinutes * 60

  // Load any open session for this task — picks up wherever it was left,
  // including time that passed while this component wasn't mounted at all.
  useEffect(() => {
    if (!userId) return
    const today = new Date().toISOString().split('T')[0]
    const existing = loadSession(userId, taskId)

    // A session started on a previous calendar day is stale — the usual
    // cause is a task that sat in_progress overnight and got reactivated
    // the next day. Resuming it would silently restore a multi-hour
    // accumulated time or an already-overrun countdown from yesterday.
    if (existing && existing.startedDate !== today) {
      clearSession(userId, taskId)
      startedDateRef.current = today
      setSessionEstimatedMinutes(estimatedMinutes)
      return
    }

    startedDateRef.current = today
    if (!existing) {
      setSessionEstimatedMinutes(estimatedMinutes)
      return
    }
    accumulatedRef.current = existing.accumulatedSeconds
    resumedAtRef.current = existing.resumedAt
    setModeState(existing.mode)
    setHasOverrun(existing.hasOverrun)
    setRunning(existing.resumedAt !== null)
    setSessionEstimatedMinutes(
      typeof existing.estimatedMinutes === 'number' && !Number.isNaN(existing.estimatedMinutes)
        ? existing.estimatedMinutes
        : estimatedMinutes
    )
    setElapsed(
      existing.accumulatedSeconds +
      (existing.resumedAt ? Math.floor((Date.now() - existing.resumedAt) / 1000) : 0)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, taskId])

  const persist = useCallback((overrides: Partial<PersistedSession> = {}) => {
    if (!userId) return
    saveSession(userId, taskId, {
      mode,
      accumulatedSeconds: accumulatedRef.current,
      resumedAt: resumedAtRef.current,
      hasOverrun,
      estimatedMinutes: sessionEstimatedMinutes,
      startedDate: startedDateRef.current,
      ...overrides,
    })
  }, [userId, taskId, mode, hasOverrun, sessionEstimatedMinutes])

  useEffect(() => {
    if (!running) {
      if (tickRef.current) clearInterval(tickRef.current)
      return
    }
    tickRef.current = setInterval(() => {
      const live = accumulatedRef.current +
        (resumedAtRef.current ? Math.floor((Date.now() - resumedAtRef.current) / 1000) : 0)
      setElapsed(live)

      if (mode === 'countdown' && !hasOverrun && live >= targetSeconds) {
        accumulatedRef.current = live
        resumedAtRef.current = null
        setRunning(false)
        setHasOverrun(true)
        if (userId) persist({ accumulatedSeconds: live, resumedAt: null, hasOverrun: true })
        onCrossedRef.current?.()
      }
    }, 1000)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [running, mode, hasOverrun, targetSeconds, userId, taskId])

  const start = useCallback(() => {
    resumedAtRef.current = Date.now()
    setRunning(true)
    persist({ resumedAt: resumedAtRef.current })
  }, [persist])

  const pause = useCallback(() => {
    if (resumedAtRef.current !== null) {
      accumulatedRef.current += Math.floor((Date.now() - resumedAtRef.current) / 1000)
      resumedAtRef.current = null
    }
    setRunning(false)
    persist({ accumulatedSeconds: accumulatedRef.current, resumedAt: null })
  }, [persist])

  const resume = start

  const setMode = useCallback((m: TimerMode) => {
    setModeState(m)
    persist({ mode: m })
  }, [persist])

  // Called by Finish / Stuck / Skip. Returns the final elapsed seconds and
  // clears the session — re-entering focus on this task afterward starts fresh.
  const finalize = useCallback((): number => {
    let final = accumulatedRef.current
    if (resumedAtRef.current !== null) {
      final += Math.floor((Date.now() - resumedAtRef.current) / 1000)
    }
    if (userId) clearSession(userId, taskId)
    setRunning(false)
    return final
  }, [userId, taskId])

  return { mode, setMode, running, elapsed, hasOverrun, targetSeconds, start, pause, resume, finalize }
}