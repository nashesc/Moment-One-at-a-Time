'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play } from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import MomentumRing from '@/components/ui/MomentumRing'
import TaskCard from '@/components/dashboard/TaskCard'
import DonePanel from '@/components/dashboard/DonePanel'
import FocusPickerModal from '@/components/dashboard/FocusPickerModal'
import { useTasks, type Task } from '@/context/TaskContext'

type FocusState = 'idle' | 'focusing' | 'done'

export default function DashboardPage() {
  const { tasks, updateStatus, moveToEnd, todayTasks, doneTodayCount, totalTodayCount, loading, error } = useTasks()
  const [focused,    setFocused]    = useState<Task | null>(null)
  const [focusState, setFocusState] = useState<FocusState>('idle')
  const [showPicker, setShowPicker] = useState(true)

  // Initialize focused task when todayTasks load
  useEffect(() => {
    if (todayTasks.length > 0 && !focused) {
      const activeTasks = todayTasks.filter(t => t.status !== 'done' && t.status !== 'skipped')
      setFocused(activeTasks[0] ?? todayTasks[0])
    }
  }, [todayTasks, focused])

  // Only pending/in_progress today tasks are actionable
  const activeTasks = todayTasks.filter(t => t.status !== 'done' && t.status !== 'skipped')

  const now      = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr  = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const allDone      = todayTasks.length > 0 && todayTasks.every(t => t.status === 'done')
  const pickerTasks  = focused ? activeTasks.filter(t => t.id !== focused.id || focusState === 'idle') : activeTasks

  function handlePickerSelect(task: Task) {
    setFocused(task)
    setFocusState('idle')
    setShowPicker(false)
  }

  function handleMainBtn() {
    if (!focused) return
    if (focusState === 'idle') {
      updateStatus(focused.id, 'in_progress')
      setFocusState('focusing')
    } else if (focusState === 'focusing') {
      updateStatus(focused.id, 'done')
      setFocusState('done')
    }
  }

  function handleStuck() {
    if (!focused) return
    updateStatus(focused.id, 'stuck')
    moveToEnd(focused.id)
    const next = activeTasks.find(t => t.id !== focused.id)
    if (next) { setFocused(next); setFocusState('idle') }
  }

  function handleSkip() {
    if (!focused) return
    moveToEnd(focused.id)
    const next = activeTasks.find(t => t.id !== focused.id)
    if (next) { setFocused(next); setFocusState('idle') }
  }

  function handleNext() {
    const next = activeTasks.find(t => !focused || t.id !== focused.id)
    if (next) {
      setFocused(next)
      setFocusState('idle')
      setShowPicker(false)
    } else {
      setFocusState('idle')
      setShowPicker(false)
    }
  }

  const btnLabel = focusState === 'idle' ? 'Begin Focus' : 'Mark as Done'
  const btnBg    = focusState === 'focusing' ? 'var(--bp)' : 'var(--gp)'

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />

      <div className="flex flex-col flex-1 min-w-0 relative">

        {/* Mobile header */}
        <div className="md:hidden flex items-start justify-between px-5 pt-5 pb-2">
          <div>
            <p className="text-[12px]" style={{ color: 'var(--tg)' }}>{dateStr}</p>
            <p className="text-[20px] font-semibold mt-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
              {greeting}, Maria 🌿
            </p>
          </div>
          <Link href="/moments" className="text-[12px] px-3 py-1.5 rounded-full border"
            style={{ borderColor: 'var(--gso)', color: 'var(--gf)', background: 'white', textDecoration: 'none' }}>
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
          <Link href="/moments" className="text-[13px] px-4 py-2 rounded-full"
            style={{ color: 'var(--gf)', background: 'white', border: '1px solid var(--border)', textDecoration: 'none', boxShadow: 'var(--shadow-card)' }}>
            View all moments
          </Link>
        </div>

        {/* Error state */}
        {error && (
          <div className="mx-4 md:mx-8 rounded-2xl px-4 py-3 mb-4 text-[13px]"
            style={{ background: '#FEF2F2', color: '#C0392B', border: '1px solid #FBDCDC' }}>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="mx-4 md:mx-8 rounded-2xl p-8 text-center"
            style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-[14px]" style={{ color: 'var(--tg)' }}>Loading your moments...</p>
          </div>
        ) : (
          <>
            {/* Momentum ring */}
            <div className="mx-4 md:mx-8 rounded-2xl p-5 mb-4"
              style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <MomentumRing done={doneTodayCount} total={totalTodayCount} size={76} showImage />
            </div>

            {/* All done */}
            {allDone ? (
              <div className="mx-4 md:mx-8 rounded-2xl p-8 text-center"
                style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                <p className="text-4xl mb-4">🌿</p>
                <h2 className="text-[24px] font-bold mb-2"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}>
                  All done for today.
                </h2>
                <p className="text-[14px]" style={{ color: 'var(--tg)' }}>
                  You completed every moment. Rest well.
                </p>
              </div>
            ) : focused ? (
              <>
                {/* Task card */}
                <div className="mx-4 md:mx-8 mb-3">
                  <TaskCard
                    title={focused.title}
                    description={focused.description}
                    estimatedMinutes={focused.estimatedMinutes}
                    priority={focused.priority}
                    isDone={focusState === 'done'}
                  />
                </div>

                {/* Done panel */}
                {focusState === 'done' && (
                  <div className="mx-4 md:mx-8 mb-3">
                    <DonePanel taskTitle={focused.title} onNext={handleNext} />
                  </div>
                )}

                {/* Action buttons */}
                {focusState !== 'done' && (
                  <div className="mx-4 md:mx-8 flex flex-col gap-3 mb-2">
                    <button onClick={handleMainBtn}
                      className="w-full flex items-center justify-center gap-3 rounded-full py-[15px] text-[15px] font-semibold text-white transition-all duration-200 hover:opacity-90"
                      style={{ background: btnBg, boxShadow: 'var(--shadow-btn)', fontFamily: 'var(--font-body)' }}>
                      {btnLabel}
                      <span className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <Play size={12} fill="white" color="white" />
                      </span>
                    </button>
                    <div className="flex gap-2">
                      <button onClick={handleStuck}
                        className="flex-1 py-[13px] text-[14px] rounded-full"
                        style={{ color: 'var(--tg)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                        I&apos;m Stuck
                      </button>
                      <button onClick={handleSkip}
                        className="flex-1 py-[13px] text-[14px] rounded-full"
                        style={{ color: 'var(--tg)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                        Skip for now
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}

            {/* Focus picker — mobile fixed overlay */}
            {showPicker && !allDone && activeTasks.length > 0 && (
              <div className="md:hidden fixed inset-0 z-30">
                <FocusPickerModal tasks={activeTasks} onSelect={handlePickerSelect} />
              </div>
            )}

            {/* Focus picker — desktop inline */}
            {showPicker && !allDone && activeTasks.length > 0 && (
              <div className="hidden md:block mx-8 mt-2 mb-4 rounded-3xl overflow-hidden border"
                style={{ borderColor: 'var(--border)' }}>
                <FocusPickerModal tasks={activeTasks} onSelect={handlePickerSelect} />
              </div>
            )}
          </>
        )}

        <div className="h-24 md:hidden" />
      </div>

      {/* Desktop right panel */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-l px-6 pt-8"
        style={{ borderColor: 'var(--border)', background: 'var(--ow)' }}>
        <p className="text-[12px] uppercase tracking-widest mb-4" style={{ color: 'var(--tg)' }}>
          Today&apos;s Overview
        </p>
        {[
          { label: 'Completed',   count: todayTasks.filter(t => t.status === 'done').length,        dot: '#3B6D11' },
          { label: 'In Progress', count: todayTasks.filter(t => t.status === 'in_progress').length, dot: '#185FA5' },
          { label: 'Stuck',       count: todayTasks.filter(t => t.status === 'stuck').length,       dot: '#854F0B' },
          { label: 'Pending',     count: todayTasks.filter(t => t.status === 'pending').length,     dot: '#888780' },
        ].map(({ label, count, dot }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b"
            style={{ borderColor: 'var(--border)' }}>
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
            <polyline points="0,40 33,28 66,35 100,12 133,22 166,38 200,18"
              fill="none" stroke="var(--gs)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="200" cy="18" r="3.5" fill="var(--gp)" />
          </svg>
        </div>
      </aside>

      <BottomNav />
    </div>
  )
}