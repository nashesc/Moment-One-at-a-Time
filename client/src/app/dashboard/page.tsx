'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Play } from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import MomentumRing from '@/components/ui/MomentumRing'
import TaskCard from '@/components/dashboard/TaskCard'
import DonePanel from '@/components/dashboard/DonePanel'
import FocusPickerModal from '@/components/dashboard/FocusPickerModal'

const INITIAL_TASKS = [
  { id: '1', title: 'Design the landing page',            description: "Create a clean and emotional landing page that explains the app's philosophy.", estimatedMinutes: 60, priority: 1 as const },
  { id: '2', title: 'Write content for features section', description: 'Draft copy for each of the three core feature blocks.',                          estimatedMinutes: 45, priority: 2 as const },
  { id: '3', title: 'Prepare design system',              description: 'Document all tokens, components, and patterns used across the app.',               estimatedMinutes: 80, priority: 1 as const },
  { id: '4', title: 'Test the onboarding flow',           description: 'Walk through the full onboarding as a new user and note friction points.',         estimatedMinutes: 30, priority: 2 as const },
  { id: '5', title: "Plan tomorrow's priorities",         description: 'Spend 20 minutes reflecting on what matters most for tomorrow.',                   estimatedMinutes: 20, priority: 3 as const },
]

type Task = typeof INITIAL_TASKS[0]
type TaskState = 'idle' | 'focusing' | 'done'

export default function DashboardPage() {
  // Remaining tasks (not yet done) — order matters for skip/stuck
  const [remaining, setRemaining] = useState<Task[]>(INITIAL_TASKS)
  const [doneIds, setDoneIds]     = useState<Set<string>>(new Set())
  const [focused, setFocused]     = useState<Task>(INITIAL_TASKS[0])
  const [taskState, setTaskState] = useState<TaskState>('idle')
  const [showPicker, setShowPicker] = useState(true)

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr  = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const totalTasks = INITIAL_TASKS.length
  const doneCount  = doneIds.size
  const allDone    = doneCount === totalTasks

  // --- Helpers ---

  function pickNext(fromList: Task[]) {
    // Filter out the current focused task and already-done tasks
    const candidates = fromList.filter(t => t.id !== focused.id && !doneIds.has(t.id))
    if (candidates.length === 0) return null
    return candidates[0]
  }

  function markCurrentDone() {
    const newDoneIds = new Set(doneIds)
    newDoneIds.add(focused.id)
    setDoneIds(newDoneIds)
    const newRemaining = remaining.filter(t => t.id !== focused.id)
    setRemaining(newRemaining)
    setTaskState('done')
  }

  function advanceToNext() {
    const candidates = remaining.filter(t => t.id !== focused.id && !doneIds.has(t.id))
    if (candidates.length === 0) {
      // All done
      setTaskState('idle')
      setShowPicker(false)
      return
    }
    setFocused(candidates[0])
    setTaskState('idle')
    setShowPicker(false)
  }

  function handleStuck() {
    // Move focused task to end of remaining list, pick next
    const others = remaining.filter(t => t.id !== focused.id)
    const newRemaining = [...others, focused]
    setRemaining(newRemaining)
    const next = others[0]
    if (next) {
      setFocused(next)
      setTaskState('idle')
    }
  }

  function handleSkip() {
    // Same as stuck — soft, no checkin, move to end
    const others = remaining.filter(t => t.id !== focused.id)
    const newRemaining = [...others, focused]
    setRemaining(newRemaining)
    const next = others[0]
    if (next) {
      setFocused(next)
      setTaskState('idle')
    }
  }

  function handleMainBtn() {
    if (taskState === 'idle')     { setTaskState('focusing'); return }
    if (taskState === 'focusing') { markCurrentDone(); return }
  }

  function handlePickerSelect(task: Task) {
    setFocused(task)
    setTaskState('idle')
    setShowPicker(false)
  }

  const btnLabel = taskState === 'idle' ? 'Begin Focus' : 'Mark as Done'
  const btnBg    = taskState === 'focusing' ? 'var(--bp)' : 'var(--gp)'

  // Picker only shows tasks not yet done
  const pickerTasks = remaining.filter(t => !doneIds.has(t.id))

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 relative">

        {/* Mobile header */}
        <div className="md:hidden flex items-start justify-between px-5 pt-5 pb-2">
          <div>
            <p className="text-[12px]" style={{ color: 'var(--tg)' }}>{dateStr}</p>
            <p className="text-[20px] font-semibold mt-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
              {greeting}, Maria 🌿
            </p>
          </div>
          <Link
            href="/moments"
            className="text-[12px] px-3 py-1.5 rounded-full border"
            style={{ borderColor: 'var(--gso)', color: 'var(--gf)', background: 'white', textDecoration: 'none' }}
          >
            View all
          </Link>
        </div>

        {/* Desktop header */}
        <div className="hidden md:flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <p className="text-[13px]" style={{ color: 'var(--tg)' }}>{dateStr}</p>
            <p className="text-[24px] font-bold mt-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
              {greeting}, Maria 🌿
            </p>
          </div>
          <Link
            href="/moments"
            className="text-[13px] px-4 py-2 rounded-full"
            style={{ color: 'var(--gf)', background: 'white', border: '1px solid var(--border)', textDecoration: 'none', boxShadow: 'var(--shadow-card)' }}
          >
            View all moments
          </Link>
        </div>

        {/* Momentum ring */}
        <div className="mx-4 md:mx-8 rounded-2xl p-5 mb-4" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
          <MomentumRing done={doneCount} total={totalTasks} size={76} showImage />
        </div>

        {/* All done state */}
        {allDone ? (
          <div
            className="mx-4 md:mx-8 rounded-2xl p-8 text-center"
            style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
          >
            <p className="text-4xl mb-4">🌿</p>
            <h2
              className="text-[24px] font-bold mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}
            >
              All done for today.
            </h2>
            <p className="text-[14px]" style={{ color: 'var(--tg)' }}>
              You completed every moment. Rest well.
            </p>
          </div>
        ) : (
          <>
            {/* Task card */}
            <div className="mx-4 md:mx-8 mb-3">
              <TaskCard
                title={focused.title}
                description={focused.description}
                estimatedMinutes={focused.estimatedMinutes}
                priority={focused.priority}
                isDone={taskState === 'done'}
              />
            </div>

            {/* Done panel — shown after marking done, before advancing */}
            {taskState === 'done' && (
              <div className="mx-4 md:mx-8 mb-3">
                <DonePanel taskTitle={focused.title} onNext={advanceToNext} />
              </div>
            )}

            {/* Action buttons — hidden while done panel is showing */}
            {taskState !== 'done' && (
              <div className="mx-4 md:mx-8 flex flex-col gap-3 mb-2">
                <button
                  onClick={handleMainBtn}
                  className="w-full flex items-center justify-center gap-3 rounded-full py-[15px] text-[15px] font-semibold text-white transition-all duration-200 hover:opacity-90"
                  style={{ background: btnBg, boxShadow: 'var(--shadow-btn)', fontFamily: 'var(--font-body)' }}
                >
                  {btnLabel}
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  >
                    <Play size={12} fill="white" color="white" />
                  </span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleStuck}
                    className="flex-1 py-[13px] text-[14px] rounded-full transition-colors duration-150"
                    style={{ color: 'var(--tg)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                  >
                    I&apos;m Stuck
                  </button>
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-[13px] text-[14px] rounded-full transition-colors duration-150"
                    style={{ color: 'var(--tg)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Focus picker — fixed overlay on mobile, hidden on desktop (shown inline below) */}
        {showPicker && !allDone && pickerTasks.length > 0 && (
          <div className="md:hidden fixed inset-0 z-30">
            <FocusPickerModal tasks={pickerTasks} onSelect={handlePickerSelect} />
          </div>
        )}

        {/* Focus picker — inline on desktop */}
        {showPicker && !allDone && pickerTasks.length > 0 && (
          <div className="hidden md:block mx-8 mt-2 mb-4 rounded-3xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            <FocusPickerModal tasks={pickerTasks} onSelect={handlePickerSelect} />
          </div>
        )}

        <div className="h-24 md:hidden" />
      </div>

      {/* Desktop right panel */}
      <aside
        className="hidden lg:flex flex-col w-72 shrink-0 border-l px-6 pt-8"
        style={{ borderColor: 'var(--border)', background: 'var(--ow)' }}
      >
        <p className="text-[12px] uppercase tracking-widest mb-4" style={{ color: 'var(--tg)' }}>
          Today&apos;s Overview
        </p>
        {[
          { label: 'Completed',   count: doneCount,                  dot: '#3B6D11' },
          { label: 'In Progress', count: taskState === 'focusing' ? 1 : 0, dot: '#185FA5' },
          { label: 'Stuck',       count: 0,                          dot: '#854F0B' },
          { label: 'Pending',     count: remaining.length - (taskState === 'focusing' ? 1 : 0), dot: '#888780' },
        ].map(({ label, count, dot }) => (
          <div
            key={label}
            className="flex items-center justify-between py-3 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--td)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: dot }} />
              {label}
            </span>
            <span className="text-[13px] font-medium" style={{ color: 'var(--td)' }}>{count}</span>
          </div>
        ))}

        <div className="mt-6">
          <p className="text-[12px] uppercase tracking-widest mb-1" style={{ color: 'var(--tg)' }}>Momentum</p>
          <p className="text-[12px] mb-4" style={{ color: 'var(--tg)' }}>Keep going, you&apos;re doing great.</p>
          <svg viewBox="0 0 200 50" className="w-full" style={{ height: 48 }}>
            <polyline
              points="0,40 33,28 66,35 100,12 133,22 166,38 200,18"
              fill="none"
              stroke="var(--gs)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="200" cy="18" r="3.5" fill="var(--gp)" />
          </svg>
        </div>
      </aside>

      <BottomNav />
    </div>
  )
}