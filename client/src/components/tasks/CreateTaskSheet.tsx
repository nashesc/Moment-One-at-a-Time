'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Clock, Flag } from 'lucide-react'
import { useTasks } from '@/context/TaskContext'
import ProGateModal from '@/components/plan/ProGateModal'

interface CreateTaskSheetProps {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

const PRIORITY_OPTIONS = [
  { value: 1 as const, label: 'High',   dot: '#5A9E50' },
  { value: 2 as const, label: 'Medium', dot: 'var(--gold-dark)' },
  { value: 3 as const, label: 'Low',    dot: '#1B3A6B' },
]

const TIME_OPTIONS = [15, 30, 45, 60, 90, 120]

export default function CreateTaskSheet({ open, onClose, onCreated }: CreateTaskSheetProps) {
  const { addTask } = useTasks()
  const [title, setTitle]       = useState('')
  const [description, setDesc]  = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')
  const [showProGate, setShowProGate] = useState(false)
  const isSubmittingRef = useRef(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const [priority, setPriority] = useState<1 | 2 | 3>(() => {
    if (typeof window === 'undefined') return 2
    const stored = localStorage.getItem('moment_task_sheet_priority')
    const parsed = stored ? parseInt(stored) : NaN
    return ([1, 2, 3].includes(parsed) ? parsed : 2) as 1 | 2 | 3
  })
  const [minutes, setMinutes] = useState<number>(() => {
    if (typeof window === 'undefined') return 30
    const stored = localStorage.getItem('moment_task_sheet_minutes')
    const parsed = stored ? parseInt(stored) : NaN
    return [15, 30, 45, 60, 90, 120].includes(parsed) ? parsed : 30
  })

  // Focus title on open
  useEffect(() => {
    if (open) {
      setTitle('')
      setDesc('')
      setError('')
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Please enter a task title.'); return }
    if (isSubmittingRef.current) return  // block double-tap before setState catches up
    isSubmittingRef.current = true
    setSubmitting(true)
    setError('')
    try {
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        estimatedMinutes: minutes,
      })
      onCreated ? onCreated() : onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.toLowerCase().includes('limited to 7') || msg.toLowerCase().includes('free plan')) {
        setShowProGate(true)
      } else {
        setError('Failed to create task. Please try again.')
      }
    } finally {
      setSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  return (
    <>
      <ProGateModal
        open={showProGate}
        onClose={() => setShowProGate(false)}
        featureName="More Tasks Today"
        description="You've reached the 7-task daily limit on the free plan. Upgrade to Pro for unlimited tasks."
      />
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 transition-opacity duration-200"
          style={{ 
            background: 'rgba(26,26,26,0.55)', 
            opacity: open ? 1 : 0, 
            pointerEvents: open ? 'auto' : 'none' 
          }}
          onClick={onClose}
        />

        {/* Sheet — bottom sheet on mobile, centered modal on desktop */}
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center pointer-events-none">
          <div
            className="w-full md:w-[480px] md:max-w-[90vw] rounded-t-3xl md:rounded-3xl transition-[transform,opacity] duration-300"
            style={{
              background: 'var(--ow)', boxShadow: '0 -4px 32px rgba(0,0,0,0.12)', maxHeight: '92vh', overflowY: 'auto',
              transform: open ? 'translateY(0)' : 'translateY(100%)',
              opacity: open ? 1 : 0,
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: open ? 'auto' : 'none',
            }}
            inert={!open}
            onTransitionEnd={(e) => { if (open && e.propertyName === 'transform') titleRef.current?.focus() }}
          >
            {/* Handle — drag affordance only makes sense as a bottom sheet */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--gso)' }} />                
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-2 pb-4">
              <h2
                className="text-[20px] font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}
              >
                New moment
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--gpa)', border: 'none', cursor: 'pointer' }}
                aria-label="Close"
              >
                <X size={16} strokeWidth={2} color="var(--gp)" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--tg)' }}>
                  What's the moment?
                </label>
                <input
                  ref={titleRef}
                  value={title}
                  onChange={e => { setTitle(e.target.value); setError('') }}
                  placeholder="e.g. Review project proposal"
                  maxLength={100}
                  className="w-full rounded-2xl px-4 py-3.5 text-[15px] outline-none transition-all"
                  style={{
                    border: error ? '1.5px solid #C0392B' : '1.5px solid var(--border)',
                    background: 'white',
                    color: 'var(--td)',
                    fontFamily: 'var(--font-body)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--gs)')}
                  onBlur={e  => (e.target.style.borderColor = error ? '#C0392B' : 'var(--border)')}
                />
                {error && (
                  <p className="text-[12px] mt-1.5" style={{ color: '#C0392B' }}>{error}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--tg)' }}>
                  Notes <span style={{ color: 'var(--tgl)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Any context or details..."
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-2xl px-4 py-3.5 text-[14px] outline-none resize-none transition-all"
                  style={{
                    border: '1.5px solid var(--border)',
                    background: 'white',
                    color: 'var(--td)',
                    fontFamily: 'var(--font-body)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--gs)')}
                  onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--tg)' }}>
                  <Flag size={11} className="inline mr-1" />Priority
                </label>
                <div className="flex gap-2">
                  {PRIORITY_OPTIONS.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        setPriority(p.value)
                        localStorage.setItem('moment_task_sheet_priority', String(p.value))
                      }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-medium transition-all duration-150"
                      style={{
                        background: priority === p.value ? 'var(--gpa)' : 'white',
                        border: priority === p.value ? '1.5px solid var(--gs)' : '1.5px solid var(--border)',
                        color: priority === p.value ? 'var(--gp)' : 'var(--tg)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        boxShadow: priority === p.value ? 'none' : 'var(--shadow-card)',
                      }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.dot }} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time estimate */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--tg)' }}>
                  <Clock size={11} className="inline mr-1" />Estimated time
                </label>
                <div className="flex gap-2 flex-wrap">
                  {TIME_OPTIONS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setMinutes(t)
                        localStorage.setItem('moment_task_sheet_minutes', String(t))
                      }}
                      className="rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-150"
                      style={{
                        background: minutes === t ? 'var(--gp)' : 'white',
                        color: minutes === t ? 'white' : 'var(--tg)',
                        border: minutes === t ? 'none' : '1.5px solid var(--border)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        boxShadow: minutes === t ? 'var(--shadow-btn)' : 'var(--shadow-card)',
                      }}
                    >
                      {t >= 60 ? `${t / 60}h` : `${t}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="w-full rounded-full py-4 text-[15px] font-semibold text-white transition-all mt-2 disabled:opacity-50"
                style={{
                  background: 'var(--gp)',
                  boxShadow: 'var(--shadow-btn)',
                  fontFamily: 'var(--font-body)',
                  cursor: submitting || !title.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Adding...' : 'Add to today'}
              </button>
              <div className="md:hidden" style={{ height: '32px' }} />
            </form>
          </div>
        </div>
    </>
  )
}