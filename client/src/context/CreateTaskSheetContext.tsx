// context/CreateTaskSheetContext.tsx
'use client'

import { createContext, useContext, useState, useRef, useCallback } from 'react'
import CreateTaskSheet from '@/components/tasks/CreateTaskSheet'
import ProGateModal from '@/components/plan/ProGateModal'
import { useTasks } from '@/context/TaskContext'
import { usePlan } from '@/context/PlanContext'

interface CreateTaskSheetContextValue {
  openSheet: (onClose?: () => void) => void
}

const CreateTaskSheetContext = createContext<CreateTaskSheetContextValue | null>(null)
const FREE_DAILY_TASK_LIMIT = 7

export function CreateTaskSheetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const onCloseRef = useRef<(() => void) | null>(null)
  const { totalTodayCount } = useTasks()
  const { isPro } = usePlan()

  const openSheet = useCallback((onClose?: () => void) => {
    if (!isPro && totalTodayCount >= FREE_DAILY_TASK_LIMIT) {
      setGateOpen(true)
      return
    }
    onCloseRef.current = onClose ?? null
    setOpen(true)
  }, [isPro, totalTodayCount])

  // Cancel — sheet dismissed without creating a task. Fires the caller's reset callback.
  const handleCancel = useCallback(() => {
    setOpen(false)
    onCloseRef.current?.()
    onCloseRef.current = null
  }, [])

  // Success — task was created. Hide the sheet only; the reset callback exists to
  // undo dashboard focus state on abandonment, not on a completed action.
  const handleCreated = useCallback(() => {
    setOpen(false)
    onCloseRef.current = null
  }, [])

  return (
    <CreateTaskSheetContext.Provider value={{ openSheet }}>
      {children}
      <CreateTaskSheet open={open} onClose={handleCancel} onCreated={handleCreated} />
      <ProGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        featureName="More Tasks Today"
        description="You've reached the 7-task daily limit on the free plan. Upgrade to Pro for unlimited tasks."
      />
    </CreateTaskSheetContext.Provider>
  )
}

export function useCreateTaskSheet() {
  const ctx = useContext(CreateTaskSheetContext)
  if (!ctx) throw new Error('useCreateTaskSheet must be used inside CreateTaskSheetProvider')
  return ctx
}