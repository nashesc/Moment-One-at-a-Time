'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Play, RefreshCw, Leaf } from 'lucide-react'
import MomentumRing from '@/components/ui/MomentumRing'
import TaskCard from '@/components/dashboard/TaskCard'
import DonePanel from '@/components/dashboard/DonePanel'
import FocusPickerModal from '@/components/dashboard/FocusPickerModal'
import TaskRow from '@/components/tasks/TaskRow'
import { useTasks, useActivateTasks, type Task } from '@/context/TaskContext'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import { Plus } from 'lucide-react'
import { useCreateTaskSheet } from '@/context/CreateTaskSheetContext'
import { motion, AnimatePresence } from 'motion/react'
import FocusOverlay from '@/components/dashboard/FocusOverlay'
import { useMusic } from '@/context/MusicContext'
import { useFabOffset } from '@/hooks/useFabOffset'
import StuckSheet from '@/components/dashboard/StuckSheet'

type FocusState = 'idle' | 'focusing' | 'done'

export default function DashboardPage() {
  useActivateTasks()
  const { todayTasks, updateStatus, moveToEnd, doneTodayCount, totalTodayCount, loading, error, refresh, isOffline } = useTasks()
  const { profile } = useAuth()
  const { prefs } = useSettings()
  const { currentTrack } = useMusic()
  const { openSheet } = useCreateTaskSheet()

  const activeTasks = useMemo(
    () => todayTasks.filter(t => t.status !== 'done' && t.status !== 'skipped'),
    [todayTasks]
  )

  const [focused,    setFocused]    = useState<Task | null>(null)
  const [focusState, setFocusState] = useState<FocusState>('idle')
  const [showPicker, setShowPicker] = useState(true)
  const [forceFocusView, setForceFocusView] = useState(false)

  // Auto-select the task if there's only one — no need to show the picker
  useEffect(() => {
  if (loading) return
  if (focused) return

  // Restore any in-progress task — handles returning from another page
  const inProgress = activeTasks.find(t => t.status === 'in_progress')
  if (inProgress) {
    setFocused(inProgress)
    setFocusState('focusing')
    setShowPicker(false)
    return
  }

  // Auto-select when only one task remains (skip picker)
  if (showPicker && activeTasks.length === 1) {
    setFocused(activeTasks[0])
    setFocusState('idle')
    setShowPicker(false)
  }
}, [loading, activeTasks, focused, showPicker])


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
    }
    setOverlayOpen(true)
  }

  function handleOverlayFinish(durationSeconds: number) {
    if (!currentTask) return
    updateStatus(currentTask.id, 'done', { durationSeconds })
    setOverlayOpen(false)
    setFocusState('done')
  }

  function handleOverlaySkip(durationSeconds: number) {
    if (!currentTask) return
    updateStatus(currentTask.id, 'skipped', { durationSeconds })
    setOverlayOpen(false)
    const next = activeTasks.find(t => t.id !== currentTask.id)
    if (next) { setFocused(next); setFocusState('idle') }
    else { setFocused(null); setFocusState('idle'); setForceFocusView(false) }
  }

  function handleOverlayStuck(durationSeconds: number, reason?: string) {
    if (!currentTask) return
    updateStatus(currentTask.id, 'stuck', { stuckReason: reason, durationSeconds })
    moveToEnd(currentTask.id)
    setOverlayOpen(false)
    const next = activeTasks.find(t => t.id !== currentTask.id)
    if (next) { setFocused(next); setFocusState('idle') }
  }

  const [stuckSheetOpen, setStuckSheetOpen] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)

  function handleStuck() {
    if (!currentTask) return
    setStuckSheetOpen(true)
  }

  function commitStuck(reason?: string) {
    if (!currentTask) return
    updateStatus(currentTask.id, 'stuck', { stuckReason: reason })
    moveToEnd(currentTask.id)
    setStuckSheetOpen(false)
    const next = activeTasks.find(t => t.id !== currentTask.id)
    if (next) { setFocused(next); setFocusState('idle') }
  }

  function handleSkip() {
    if (!currentTask) return
    updateStatus(currentTask.id, 'skipped')
    const next = activeTasks.find(t => t.id !== currentTask.id)
    if (next) { setFocused(next); setFocusState('idle') }
    else { setFocused(null); setFocusState('idle'); setForceFocusView(false) }
  }

  function handleNext() {
    const next = activeTasks.find(t => t.id !== currentTask?.id)
    if (next) { setFocused(next); setFocusState('idle') }
    else { setFocused(null); setFocusState('idle'); setForceFocusView(false) }
    setShowPicker(false)
  }

  const btnLabel = focusState === 'idle' ? 'Begin Focus' : 'Resume Focus'
  const btnBg    = focusState === 'focusing' ? 'var(--bp)' : 'var(--gp)'

  // LIST VIEW — when one-at-a-time is off
  const showListView = !prefs.oneTaskAtATime && !forceFocusView

  return (
    <>
      <div className="flex flex-col flex-1 min-w-0 relative">
        <div className="moment-col moment-col--center w-full">
          {isOffline && (
            <div className="mx-4 md:mx-8 rounded-2xl px-4 py-3 mt-3 text-[13px]"
              style={{ background: '#FAEEDA', border: '1px solid #EDD59A', color: '#854F0B' }}>
              You're offline — changes will sync when you reconnect.
            </div>
          )}

          {/* Mobile header */}
          <div className="md:hidden flex items-start justify-between px-5 pt-5 pb-2">
            <div>
              <p className="text-[12px]" style={{ color: 'var(--tg)' }}>{dateStr}</p>
              <p className="text-[20px] font-semibold mt-0.5"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
                {greeting}, {firstName}{' '}
                <Leaf size={18} className="inline -mt-1 ml-1" color="var(--gp)" strokeWidth={1.75} />
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
                <span className="flex items-center gap-1.5">
                  {greeting}, {firstName}
                  <Leaf size={20} color="var(--gp)" strokeWidth={1.75} />
                </span>
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
            initial={false}
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
              <p className="mb-4 flex items-center justify-center">
                <Leaf size={40} color="var(--gp)" strokeWidth={1.5} /> 
              </p>
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
                  onClick={
                    t.status === 'pending' || t.status === 'in_progress'
                    ? () => {
                        setFocused(t)
                        setFocusState(t.status === 'in_progress' ? 'focusing' : 'idle')
                        setForceFocusView(true)
                      }
                    : undefined
                  }
                />
              ))}
            </div>
          )}

          {/* Focused view (one-at-a-time ON) */}
          {!loading && !error && !showListView && (
            <>
              {/* All done */}
              {allDone && todayTasks.length > 0 && focusState !== 'done' && (
                <div className="mx-4 md:mx-8 rounded-2xl p-8 text-center"
                  style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex justify-center mb-4">
                    <Leaf size={40} color="var(--gp)" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-[24px] font-bold mb-2"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}>
                    All done for today.
                  </h2>
                  <p className="text-[14px]" style={{ color: 'var(--tg)' }}>
                    You completed every moment. Rest well.
                  </p>
                </div>
              )}

              {!currentTask && !allDone && !showPicker && todayTasks.length > 0 && (
                <div
                  className="mx-4 md:mx-8 rounded-2xl p-6 text-center"
                  style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="flex justify-center mb-3">
                    <Leaf size={32} color="var(--gp)" strokeWidth={1.5} />
                  </div>
                  <p className="text-[16px] font-medium mb-2" style={{ color: 'var(--td)' }}>
                    Your tasks are ready when you are.
                  </p>
                  <button
                    onClick={() => setShowPicker(true)}
                    className="text-[13px] px-4 py-2 rounded-full mt-1"
                    style={{
                      background: 'var(--gpa)',
                      color: 'var(--gp)',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Pick a task to focus on
                  </button>
                </div>
              )}

              {currentTask && (!allDone || focusState === 'done') && (
                <>
                  <motion.div
                    className="mx-4 md:mx-8 mb-3"
                    initial={false}
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
                      initial={false}
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
                      {focusState === 'idle' && (
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
                      )}
                    </motion.div>
                  )}
                </>
              )}
              <StuckSheet open={stuckSheetOpen} onClose={() => setStuckSheetOpen(false)} onSubmit={commitStuck} />
              <AnimatePresence>
                {overlayOpen && currentTask && (
                  <FocusOverlay
                    task={{ id: currentTask.id, title: currentTask.title, estimatedMinutes: currentTask.estimatedMinutes }}
                    onClose={() => setOverlayOpen(false)}
                    onFinish={handleOverlayFinish}
                    onSkip={handleOverlaySkip}
                    onStuck={handleOverlayStuck}
                  />
                )}
              </AnimatePresence>
                
              {/* Focus picker — mobile fixed overlay */}
              {showPicker && !allDone && activeTasks.length > 0 && todayTasks.length > 0 && (
                <div className="md:hidden fixed inset-0 z-30">
                  <FocusPickerModal
                    tasks={activeTasks}
                    onSelect={handlePickerSelect}
                    onDismiss={() => setShowPicker(false)}
                  />
                </div>
              )}

              {/* Focus picker — desktop inline */}
              {showPicker && !allDone && activeTasks.length > 0 && todayTasks.length > 0 && (
                <div className="hidden md:block mx-8 mt-2 mb-4 rounded-3xl overflow-hidden border"
                  style={{ borderColor: 'var(--border)' }}>
                  <FocusPickerModal
                    tasks={activeTasks}
                    onSelect={handlePickerSelect}
                    onDismiss={() => setShowPicker(false)}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="md:hidden" style={{ height: currentTrack ? 200 : 152 }} />
        <div
          className="hidden md:block"
          style={{
            height: currentTrack ? 72 : 0,
            transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      {/* Desktop right panel */}
      <aside className="moment-rail">
        <div className="px-6 pt-8 pb-1">
          <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'var(--tg)' }}>
            Overview
          </p>
          <p className="text-[19px] font-bold mt-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            Today's Progress
          </p>
        </div>

        <div className="px-6 pt-5 grid grid-cols-2 gap-2.5">
          {[
            { label: 'Completed',   count: todayTasks.filter(t => t.status === 'done').length,        bg: '#EAF3DE', dot: '#3B6D11' },
            { label: 'In Progress', count: todayTasks.filter(t => t.status === 'in_progress').length, bg: '#E6F1FB', dot: '#185FA5' },
            { label: 'Stuck',       count: todayTasks.filter(t => t.status === 'stuck').length,       bg: '#FAEEDA', dot: '#854F0B' },
            { label: 'Pending',     count: todayTasks.filter(t => t.status === 'pending').length,     bg: '#F0EFE8', dot: '#888780' },
          ].map(({ label, count, bg, dot }) => (
            <div key={label} className="rounded-2xl p-4" style={{ background: bg }}>
              <p className="text-[24px] font-bold leading-none" style={{ fontFamily: 'var(--font-display)', color: dot }}>
                {count}
              </p>
              <p className="text-[12px] mt-1.5" style={{ color: dot }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Momentum card */}
        <div className="px-6 pt-6 pb-8">
          <p className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--tg)' }}>Momentum</p>
            <div className="moment-card--support" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex flex-col items-center text-center gap-3">
                <MomentumRing done={doneTodayCount} total={Math.max(totalTodayCount, 1)} size={88} />
                <p className="text-[12px]" style={{ color: 'var(--tg)' }}>
                  {totalTodayCount === 0 ? 'Add a moment to start building momentum today.' : "Keep going, you're doing great."}
                </p>
              </div>
            </div>
        </div>
      </aside>

      <motion.button
          aria-label="Add task"
          onClick={() => openSheet(() => {
            setFocusState('idle')
            setFocused(null)
            setShowPicker(true)
          })}
          className="fixed right-5 md:bottom-8 md:right-8 w-14 h-14 rounded-full text-white flex items-center justify-center z-40"
          style={{
            background: 'var(--gp)',
            boxShadow: '0 4px 20px rgba(45,90,39,0.4), 0 2px 6px rgba(45,90,39,0.2)',
            bottom: useFabOffset(),
            transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          initial={false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <Plus size={24} strokeWidth={2} color="white" />
      </motion.button>
    </>
  )
}