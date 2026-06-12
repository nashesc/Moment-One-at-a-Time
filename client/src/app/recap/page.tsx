'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Plus } from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import MomentumRing from '@/components/ui/MomentumRing'
import StatusBadge from '@/components/ui/StatusBadge'
import { getRecap, getRecapRange, getCheckins, type RecapRangeItem } from '@/lib/api'
import { useTasks, useActivateTasks } from '@/context/TaskContext'
import type { Recap, Checkin } from '@/types'
import { motion } from 'motion/react'
import CreateTaskSheet from '@/components/tasks/CreateTaskSheet'
import { useMusic } from '@/context/MusicContext'
import { usePlan } from '@/context/PlanContext'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────
type View   = 'recap' | 'reflections'
type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

const PERIOD_LABELS: Record<Period, string> = {
  daily:   'Today',
  weekly:  'This Week',
  monthly: 'This Month',
  yearly:  'This Year',
}

const QUOTES = [
  "Progress is still progress. Even the small ones.",
  "You showed up. That's everything.",
  "Every moment completed is a vote for the person you're becoming.",
  "Rest is part of the work.",
  "One step at a time — that's all it takes.",
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

async function fetchRecaps(dates: string[]): Promise<(Recap | null)[]> {
  const BATCH = 7
  const results: (Recap | null)[] = []
  for (let i = 0; i < dates.length; i += BATCH) {
    const batch = dates.slice(i, i + BATCH)
    const batchResults = await Promise.all(
      batch.map(d => getRecap(d).catch(() => null))
    )
    results.push(...batchResults)
    if (i + BATCH < dates.length) await new Promise(r => setTimeout(r, 400))
  }
  return results
}

function formatCheckinTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (d.toDateString() === now.toDateString()) return `Today · ${timeStr}`
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday · ${timeStr}`
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${timeStr}`
}

function toBadgeStatus(status: Checkin['status']): 'done' | 'stuck' | 'in_progress' | 'pending' | 'skipped' {
  if (status === 'done')     return 'done'
  if (status === 'stuck')    return 'stuck'
  if (status === 'on_track') return 'in_progress'
  if (status === 'skipped')  return 'skipped'
  return 'pending'
}

// ─── Reflections sub-view ────────────────────────────────────────────────────

function ReflectionsView() {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getCheckins()
      .then(data => { if (!cancelled) setCheckins(data) })
      .catch(() => { if (!cancelled) setError('Could not load reflections. Please try again.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[0,1,2,3].map(i => (
          <div key={i} className="rounded-2xl p-5"
            style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="skeleton h-4" style={{ width: `${45 + (i * 17) % 30}%` }} />
              <div className="skeleton h-5 w-16 rounded-full" />
            </div>
            <div className="skeleton h-3 w-full mb-2" />
            <div className="skeleton h-3 mb-4" style={{ width: `${55 + (i * 11) % 25}%` }} />
            <div className="skeleton h-3 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
        <p className="text-[14px]" style={{ color: 'var(--tg)' }}>{error}</p>
      </div>
    )
  }

  if (checkins.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
        <p className="text-4xl mb-4">🌿</p>
        <p className="text-[16px] font-medium mb-1" style={{ color: 'var(--td)' }}>No reflections yet</p>
        <p className="text-[13px]" style={{ color: 'var(--tg)' }}>
          As you work through tasks — completing, getting stuck, or noting how things felt — your reflections will appear here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl px-4 py-4 mb-4 flex gap-3 items-start"
        style={{ background: '#EAF3DE', border: '1px solid #C0DD97' }}>
        <MessageSquare size={18} strokeWidth={1.75} color="var(--gp)" className="shrink-0 mt-0.5" />
        <p className="text-[12px] leading-relaxed" style={{ color: '#3B6D11' }}>
          Every check-in on a task — finished, stuck, or noted — appears here as your personal log of how work actually felt.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {checkins.map((checkin) => (
          <div key={checkin.id} className="rounded-2xl p-5"
            style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-[15px] font-semibold" style={{ color: 'var(--td)' }}>
                {checkin.task_title ?? 'Task'}
              </p>
              <StatusBadge status={toBadgeStatus(checkin.status)} />
            </div>

            {checkin.stuck_reason && (
              <p className="text-[12px] mb-2 px-3 py-2 rounded-xl"
                style={{ background: '#FAEEDA', color: '#854F0B' }}>
                Blocked: {checkin.stuck_reason}
              </p>
            )}

            {checkin.notes ? (
              <p className="text-[13px] leading-relaxed italic mb-3" style={{ color: 'var(--tg)' }}>
                &ldquo;{checkin.notes}&rdquo;
              </p>
            ) : !checkin.stuck_reason ? (
              <p className="text-[13px] italic mb-3" style={{ color: 'var(--tgl)' }}>No notes added.</p>
            ) : null}

            <p className="text-[11px]" style={{ color: 'var(--tgl)' }}>
              {formatCheckinTime(checkin.checked_at)}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function RecapPage() {
  useActivateTasks()
  const { doneTodayCount, totalTodayCount, todayTasks } = useTasks()
  const [view, setView]           = useState<View>('recap')
  const [period, setPeriod]       = useState<Period>('daily')
  const [recaps, setRecaps]       = useState<(Recap | null)[]>([])
  const [rangeData, setRangeData] = useState<RecapRangeItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const { currentTrack } = useMusic()
  const { isPro } = usePlan()

  const loadData = useCallback(async (p: Period) => {
    if ((p === 'monthly' || p === 'yearly') && !isPro) {
    setLoading(false)
    return
  }

    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      if (p === 'daily' || p === 'weekly') {
        const dates = p === 'daily' ? [today] : getLastNDays(7)
        const data  = await fetchRecaps(dates)
        setRecaps(data)
        setRangeData([])
      } else {
        const now  = new Date()
        const from = p === 'monthly'
          ? new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
          : new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
        const groupBy = p === 'yearly' ? 'month' : 'day'
        const data = await getRecapRange(from, today, groupBy)
        setRangeData(data)
        setRecaps([])
      }
    } finally {
      setLoading(false)
    }
  }, [isPro])

  useEffect(() => {
    if (view === 'recap') loadData(period)
  }, [period, view, loadData])

  const isRange = period === 'monthly' || period === 'yearly'

  const aggDone       = isRange ? rangeData.reduce((s,r) => s + r.done, 0)    : recaps.reduce((s,r) => s + (r?.tasks_done ?? 0), 0)
  const aggTotal      = isRange ? rangeData.reduce((s,r) => s + r.total, 0)   : recaps.reduce((s,r) => s + (r?.tasks_total ?? 0), 0)
  const aggStuck      = isRange ? rangeData.reduce((s,r) => s + r.stuck, 0)   : recaps.reduce((s,r) => s + (r?.tasks_stuck ?? 0), 0)
  const aggSkipped    = isRange ? rangeData.reduce((s,r) => s + r.skipped, 0) : recaps.reduce((s,r) => s + (r?.tasks_skipped ?? 0), 0)
  const aggInProgress = Math.max(0, aggTotal - aggDone - aggStuck - aggSkipped)

  const done       = period === 'daily' ? (recaps[0]?.tasks_done    ?? doneTodayCount)  : aggDone
  const total      = period === 'daily' ? (recaps[0]?.tasks_total   ?? totalTodayCount) : aggTotal
  const stuck      = period === 'daily' ? (recaps[0]?.tasks_stuck   ?? todayTasks.filter(t => t.status === 'stuck').length)   : aggStuck
  const skipped    = period === 'daily' ? (recaps[0]?.tasks_skipped ?? todayTasks.filter(t => t.status === 'skipped').length) : aggSkipped
  const inProgress = period === 'daily'
    ? Math.max(0, (recaps[0]?.tasks_total ?? totalTodayCount) - done - stuck - skipped)
    : aggInProgress

  const quote = QUOTES[done % QUOTES.length]

  const chartBars: number[] = (() => {
    if (period === 'daily')   return getLastNDays(7).map(d => d === new Date().toISOString().split('T')[0] && total > 0 ? Math.round((done / total) * 100) : 0)
    if (period === 'weekly')  return recaps.map(r => r && r.tasks_total > 0 ? Math.round((r.tasks_done / r.tasks_total) * 100) : 0)
    return rangeData.map(r => r.momentum_score)
  })()

  const chartLabels: string[] = (() => {
    if (period === 'daily')   return getLastNDays(7).map(d => new Date(d + 'T12:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 1))
    if (period === 'weekly')  return getLastNDays(7).map(d => new Date(d + 'T12:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 1))
    if (period === 'monthly') return rangeData.map(r => new Date(r.period + 'T12:00').toLocaleDateString('en', { day: 'numeric' }))
    return rangeData.map(r => new Date(r.period + '-01T12:00').toLocaleDateString('en', { month: 'short' }))
  })()

  const chartHeading = { daily: 'Last 7 days', weekly: 'Day by day', monthly: 'Day by day', yearly: 'Month by month' }[period]

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0 md:pb-8 px-5 md:px-8"
        style={{ paddingBottom: currentTrack ? 200 : 152 }}
      >
        {/* Page header */}
        <div className="pt-6 pb-3">
          <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            {view === 'recap' ? 'Recap' : 'Reflections'}
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>
            {view === 'recap' ? 'Your momentum at a glance.' : 'How things felt, not just what was done.'}
          </p>
        </div>

        {/* View switcher */}
        <div
          className="flex w-full rounded-2xl p-1 mb-4"
          style={{ background: 'rgba(0,0,0,0.06)' }}
        >
          {(['recap', 'reflections'] as View[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex-1 py-2.5 text-[14px] font-medium capitalize rounded-xl transition-all duration-200"
              style={{
                background: view === v ? 'white' : 'transparent',
                color:      view === v ? 'var(--td)' : 'var(--tg)',
                boxShadow:  view === v ? '0 1px 4px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)' : 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* ── REFLECTIONS VIEW ── */}
        {view === 'reflections' && <ReflectionsView />}

        {/* ── RECAP VIEW ── */}
        {view === 'recap' && (
          <>
            {/* Period selector */}
            <div className="flex gap-2 pb-4 overflow-x-auto">
              {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className="whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-150"
                  style={{
                    background: period === p ? 'var(--gf)' : 'white',
                    color:      period === p ? 'white' : 'var(--tg)',
                    border:     period === p ? 'none' : '1px solid var(--border)',
                    boxShadow:  period === p ? 'var(--shadow-btn)' : 'var(--shadow-card)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>

            {(period === 'monthly' || period === 'yearly') && !isPro ? (
              <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                <div className="p-6 filter blur-sm pointer-events-none select-none opacity-60">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-[90px] h-[90px] rounded-full" style={{ background: 'var(--gpa)' }} />
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="h-4 rounded w-3/4" style={{ background: 'var(--gpa)' }} />
                      <div className="h-3 rounded w-1/2" style={{ background: 'var(--gpa)' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="rounded-2xl p-4 text-center" style={{ background: 'var(--card)' }}>
                        <div className="h-8 w-10 rounded mx-auto mb-2" style={{ background: 'var(--gpa)' }} />
                        <div className="h-3 w-16 rounded mx-auto" style={{ background: 'var(--gpa)' }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2 text-center border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-[15px] font-semibold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
                    {period === 'monthly' ? 'Monthly trends' : 'Yearly overview'} require Pro
                  </p>
                  <p className="text-[13px] mb-4" style={{ color: 'var(--tg)' }}>
                    Unlock your full momentum history.
                  </p>
                  <Link
                    href="/upgrade"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-white"
                    style={{ background: 'var(--gp)', boxShadow: 'var(--shadow-btn)', textDecoration: 'none' }}
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center gap-4">
                    <div className="skeleton rounded-full shrink-0" style={{ width: 90, height: 90 }} />
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-1/2 mt-1" />
                    </div>
                  </div>
                  <div className="skeleton h-4 w-2/3 mx-auto mt-5" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="rounded-2xl p-4 flex flex-col items-center gap-2"
                      style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                      <div className="skeleton h-8 w-10" />
                      <div className="skeleton h-3 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ) : total === 0 && period === 'daily' ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                <p className="text-4xl mb-4">🌱</p>
                <p className="text-[16px] font-medium" style={{ color: 'var(--td)' }}>No tasks today yet</p>
                <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>Add moments in the dashboard to track your day.</p>
              </div>
            ) : (
              <>
                <motion.div className="rounded-2xl p-5 mb-4"
                  style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}>
                  <MomentumRing done={done} total={Math.max(total, 1)} size={90} showImage />
                  <p className="mt-4 text-[15px] text-center italic"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}>
                    &ldquo;{quote}&rdquo;
                  </p>
                </motion.div>

                <motion.div className="grid grid-cols-2 gap-3 mb-4"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.07, ease: [0.4, 0, 0.2, 1] }}>
                  {[
                    { n: done,       label: 'Completed',   color: '#3B6D11' },
                    { n: inProgress, label: 'In Progress', color: '#185FA5' },
                    { n: stuck,      label: 'Stuck',       color: '#854F0B' },
                    { n: skipped,    label: 'Skipped',     color: '#888780' },
                  ].map(({ n, label, color }) => (
                    <div key={label} className="rounded-2xl p-4 text-center"
                      style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                      <p className="text-[28px] font-bold" style={{ fontFamily: 'var(--font-display)', color }}>{n}</p>
                      <p className="text-[12px] mt-1" style={{ color: 'var(--tg)' }}>{label}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.div className="rounded-2xl p-5"
                  style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.14, ease: [0.4, 0, 0.2, 1] }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="moment-label">{chartHeading}</p>
                    {total === 0 && period !== 'daily' && (
                      <p className="text-[10px]" style={{ color: 'var(--tgl)' }}>History builds over time</p>
                    )}
                  </div>
                  <div className="flex items-end gap-2 h-20">
                    {chartBars.map((pct, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1.5 h-full">
                        <div className="flex-1 w-full rounded-lg overflow-hidden flex items-end"
                          style={{ background: 'var(--gpa)' }}>
                          <div className="w-full rounded-lg"
                            style={{
                              height: `${Math.max(pct, pct > 0 ? 6 : 0)}%`,
                              background: pct > 0 ? 'var(--gs)' : 'var(--gpa)',
                              transition: 'height 0.7s cubic-bezier(0.4,0,0.2,1)',
                            }}
                          />
                        </div>
                        <span className="text-[9px]" style={{ color: 'var(--tg)' }}>
                          {chartLabels[i] ?? ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </>
        )}
      </div>

      <motion.button
        aria-label="Add task"
        onClick={() => setSheetOpen(true)}
        className="fixed right-5 md:bottom-8 md:right-8 w-14 h-14 rounded-full text-white flex items-center justify-center z-40"
        style={{
          background: 'var(--gp)',
          boxShadow: '0 4px 20px rgba(45,90,39,0.4), 0 2px 6px rgba(45,90,39,0.2)',
          bottom: currentTrack ? 140 : 112,
          transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        <Plus size={24} strokeWidth={2} color="white" />
      </motion.button>

      <CreateTaskSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      <BottomNav />
    </div>
  )
}