'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Play, RefreshCw } from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import MomentumRing from '@/components/ui/MomentumRing'
import TaskCard from '@/components/dashboard/TaskCard'
import DonePanel from '@/components/dashboard/DonePanel'
import FocusPickerModal from '@/components/dashboard/FocusPickerModal'
import TaskRow from '@/components/tasks/TaskRow'
import { useTasks, type Task } from '@/context/TaskContext'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import { Plus } from 'lucide-react'
import CreateTaskSheet from '@/components/tasks/CreateTaskSheet'
import { motion } from 'motion/react'

type FocusState = 'idle' | 'focusing' | 'done'

export default function DashboardPage() {
  const { todayTasks, updateStatus, moveToEnd, doneTodayCount, totalTodayCount, loading, error, refresh } = useTasks()
  const { profile } = useAuth()
  const { prefs } = useSettings()

  const activeTasks = useMemo(
    () => todayTasks.filter(t => t.status !== 'done' && t.status !== 'skipped'),
    [todayTasks]
  )

  const [focused,    setFocused]    = useState<Task | null>(null)
  const [focusState, setFocusState] = useState<FocusState>('idle')
  const [showPicker, setShowPicker] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Auto-select the task if there's only one — no need to show the picker
  useEffect(() => {
    if (!loading && showPicker && activeTasks.length === 1 && !focused) {
      setFocused(activeTasks[0])
      setFocusState('idle')
      setShowPicker(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, showPicker, activeTasks.length])

  const now      = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr  = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  const allDone = todayTasks.length > 0 && todayTasks.every(t => t.status === 'done' || t.status === 'skipped')
  const currentTask = focused ?? activeTasks[0] ?? null

  function handlePickerSelect(task: Task) {
    setFocused(task)
    setFocusState('idle')
    setShowPicker(false)
  }

  function handleMainBtn() {
    if (!currentTask) return
    if (focusState === 'idle') {
      updateStatus(currentTask.id, 'in_progress')
      setFocusState('focusing')
    } else if (focusState === 'focusing') {
      updateStatus(currentTask.id, 'done')
      setFocusState('done')
    }
  }

  function handleStuck() {
    if (!currentTask) return
    updateStatus(currentTask.id, 'stuck')
    moveToEnd(currentTask.id)
    const next = activeTasks.find(t => t.id !== currentTask.id)
    if (next) { setFocused(next); setFocusState('idle') }
    else { setFocused(null); setFocusState('idle') }
  }

  function handleSkip() {
    if (!currentTask) return
    moveToEnd(currentTask.id)
    const next = activeTasks.find(t => t.id !== currentTask.id)
    if (next) { setFocused(next); setFocusState('idle') }
    else { setFocused(null); setFocusState('idle') }
  }

  function handleNext() {
    const next = activeTasks.find(t => t.id !== currentTask?.id)
    if (next) { setFocused(next); setFocusState('idle') }
    else { setFocused(null); setFocusState('idle') }
    setShowPicker(false)
  }

  const btnLabel = focusState === 'idle' ? 'Begin Focus' : 'Mark as Done'
  const btnBg    = focusState === 'focusing' ? 'var(--bp)' : 'var(--gp)'

  // LIST VIEW — when one-at-a-time is off
  const showListView = !prefs.oneTaskAtATime

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />

      <div className="flex flex-col flex-1 min-w-0 relative">

        {/* Mobile header */}
        <div className="md:hidden flex items-start justify-between px-5 pt-5 pb-2">
          <div>
            <p className="text-[12px]" style={{ color: 'var(--tg)' }}>{dateStr}</p>
            <p className="text-[20px] font-semibold mt-0.5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
              {greeting}, {firstName} 🌿
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
            <p className="text-[24px] font-bold mt-0.5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
              {greeting}, {firstName} 🌿
            </p>
          </div>
          <Link href="/moments" className="text-[13px] px-4 py-2 rounded-full"
            style={{ color: 'var(--gf)', background: 'white', border: '1px solid var(--border)', textDecoration: 'none', boxShadow: 'var(--shadow-card)' }}>
            View all moments
          </Link>
        </div>

        {/* Momentum ring */}
        <motion.div
          className="mx-4 md:mx-8 rounded-2xl p-5 mb-4"
          style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          <MomentumRing done={doneTodayCount} total={totalTodayCount} size={76} showImage />
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="mx-4 md:mx-8 flex flex-col gap-3">
            <div className="rounded-2xl p-6" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <div className="skeleton h-3 w-24 mb-4" />
              <div className="skeleton h-7 w-full mb-2" />
              <div className="skeleton h-7 w-3/4 mb-6" />
              <div className="flex gap-4">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-3 w-20" />
              </div>
            </div>
            <div className="skeleton h-14 w-full rounded-full" />
            <div className="flex gap-2">
              <div className="skeleton h-12 flex-1 rounded-full" />
              <div className="skeleton h-12 flex-1 rounded-full" />
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="mx-4 md:mx-8 rounded-2xl p-6 text-center"
            style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-[14px] mb-3" style={{ color: 'var(--tg)' }}>{error}</p>
            <button onClick={refresh}
              className="flex items-center gap-2 mx-auto text-[13px] px-4 py-2 rounded-full"
              style={{ background: 'var(--gpa)', color: 'var(--gp)', border: 'none', cursor: 'pointer' }}>
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && todayTasks.length === 0 && (
          <div className="mx-4 md:mx-8 rounded-2xl p-8 text-center"
            style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-4xl mb-4">🌱</p>
            <h2 className="text-[20px] font-bold mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
              No moments yet
            </h2>
            <p className="text-[14px]" style={{ color: 'var(--tg)' }}>
              Head to Moments to add your first task for today.
            </p>
          </div>
        )}

        {/* List view (one-at-a-time OFF) */}
        {!loading && !error && showListView && todayTasks.length > 0 && (
          <div className="mx-4 md:mx-8 flex flex-col gap-2 mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest px-1 pb-1" style={{ color: 'var(--tg)' }}>
              Today&apos;s Moments
            </p>
            {todayTasks.map(t => (
              <TaskRow
                key={t.id}
                title={t.title}
                date="Today"
                estimatedMinutes={t.estimatedMinutes}
                priority={t.priority}
                status={t.status}
              />
            ))}
          </div>
        )}

        {/* Focused view (one-at-a-time ON) */}
        {!loading && !error && !showListView && (
          <>
            {/* All done */}
            {allDone && todayTasks.length > 0 && (
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
            )}

            {currentTask && !allDone && (
              <>
                <motion.div
                  className="mx-4 md:mx-8 mb-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
                >
                  <TaskCard
                    title={currentTask.title}
                    description={currentTask.description}
                    estimatedMinutes={currentTask.estimatedMinutes}
                    priority={currentTask.priority}
                    isDone={focusState === 'done'}
                  />
                </motion.div>

                {focusState === 'done' && (
                  <div className="mx-4 md:mx-8 mb-3">
                    <DonePanel taskTitle={currentTask.title} onNext={handleNext} />
                  </div>
                )}

                {focusState !== 'done' && (
                  <motion.div
                    className="mx-4 md:mx-8 flex flex-col gap-3 mb-2"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                  >
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
                  </motion.div>
                )}
              </>
            )}

            {/* Focus picker — mobile fixed overlay */}
            {showPicker && !allDone && activeTasks.length > 0 && todayTasks.length > 0 && (
              <div className="md:hidden fixed inset-0 z-30">
                <FocusPickerModal tasks={activeTasks} onSelect={handlePickerSelect} />
              </div>
            )}

            {/* Focus picker — desktop inline */}
            {showPicker && !allDone && activeTasks.length > 0 && todayTasks.length > 0 && (
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

      <motion.button
          aria-label="Add task"
          onClick={() => setSheetOpen(true)}
          className="fixed bottom-28 right-5 md:bottom-8 md:right-8 w-14 h-14 rounded-full text-white flex items-center justify-center z-40"
          style={{ background: 'var(--gp)', boxShadow: '0 4px 20px rgba(45,90,39,0.4), 0 2px 6px rgba(45,90,39,0.2)' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <Plus size={24} strokeWidth={2} color="white" />
        </motion.button>

        <CreateTaskSheet open={sheetOpen} onClose={() => {
          setSheetOpen(false)
          setFocusState('idle')
          setFocused(null)
          setShowPicker(true)
        }} />

      <BottomNav />
    </div>
  )
}