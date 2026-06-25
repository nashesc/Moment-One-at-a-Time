'use client'

import { createContext, useContext, useState, useRef, useCallback } from 'react'
import CreateTaskSheet from '@/components/tasks/CreateTaskSheet'

interface CreateTaskSheetContextValue {
  openSheet: (onClose?: () => void) => void
}

const CreateTaskSheetContext = createContext<CreateTaskSheetContextValue | null>(null)

export function CreateTaskSheetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const onCloseRef = useRef<(() => void) | null>(null)

  const openSheet = useCallback((onClose?: () => void) => {
    onCloseRef.current = onClose ?? null
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    onCloseRef.current?.()
    onCloseRef.current = null
  }, [])

  return (
    <CreateTaskSheetContext.Provider value={{ openSheet }}>
      {children}
      <CreateTaskSheet open={open} onClose={handleClose} />
    </CreateTaskSheetContext.Provider>
  )
}

export function useCreateTaskSheet() {
  const ctx = useContext(CreateTaskSheetContext)
  if (!ctx) throw new Error('useCreateTaskSheet must be used inside CreateTaskSheetProvider')
  return ctx
}