'use client'

import { useState, useEffect, useCallback } from 'react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import MomentumRing from '@/components/ui/MomentumRing'
import { getRecap, getRecapRange, type RecapRangeItem } from '@/lib/api'
import { useTasks } from '@/context/TaskContext'
import type { Recap } from '@/types'
import { motion } from 'motion/react'

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

export default function RecapPage() {
  const { doneTodayCount, totalTodayCount, todayTasks } = useTasks()
  const [period, setPeriod]       = useState<Period>('daily')
  const [recaps, setRecaps]       = useState<(Recap | null)[]>([])
  const [rangeData, setRangeData] = useState<RecapRangeItem[]>([])
  const [loading, setLoading]     = useState(true)

  const loadData = useCallback(async (p: Period) => {
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
  }, [])

  useEffect(() => { loadData(period) }, [period, loadData])

  const isRange = period === 'monthly' || period === 'yearly'

  // Aggregate stats
  const aggDone       = isRange
    ? rangeData.reduce((s, r) => s + r.done, 0)
    : recaps.reduce((s, r) => s + (r?.tasks_done ?? 0), 0)
  const aggTotal      = isRange
    ? rangeData.reduce((s, r) => s + r.total, 0)
    : recaps.reduce((s, r) => s + (r?.tasks_total ?? 0), 0)
  const aggStuck      = isRange
    ? rangeData.reduce((s, r) => s + r.stuck, 0)
    : recaps.reduce((s, r) => s + (r?.tasks_stuck ?? 0), 0)
  const aggSkipped    = isRange
    ? rangeData.reduce((s, r) => s + r.skipped, 0)
    : recaps.reduce((s, r) => s + (r?.tasks_skipped ?? 0), 0)
  const aggInProgress = Math.max(0, aggTotal - aggDone - aggStuck - aggSkipped)

  const done       = period === 'daily' ? (recaps[0]?.tasks_done    ?? doneTodayCount)  : aggDone
  const total      = period === 'daily' ? (recaps[0]?.tasks_total   ?? totalTodayCount) : aggTotal
  const stuck      = period === 'daily' ? (recaps[0]?.tasks_stuck   ?? todayTasks.filter(t => t.status === 'stuck').length)   : aggStuck
  const skipped    = period === 'daily' ? (recaps[0]?.tasks_skipped ?? todayTasks.filter(t => t.status === 'skipped').length) : aggSkipped
  const inProgress = period === 'daily'
    ? Math.max(0, (recaps[0]?.tasks_total ?? totalTodayCount) - done - stuck - skipped)
    : aggInProgress

  const quote = QUOTES[done % QUOTES.length]

  // Chart
  const chartBars: number[] = (() => {
    if (period === 'daily') {
      return getLastNDays(7).map(d =>
        d === new Date().toISOString().split('T')[0] && total > 0
          ? Math.round((done / total) * 100)
          : 0
      )
    }
    if (period === 'weekly') {
      return recaps.map(r =>
        r && r.tasks_total > 0 ? Math.round((r.tasks_done / r.tasks_total) * 100) : 0
      )
    }
    return rangeData.map(r => r.momentum_score)
  })()

  const chartLabels: string[] = (() => {
    if (period === 'daily')   return getLastNDays(7).map(d => new Date(d + 'T12:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 1))
    if (period === 'weekly')  return getLastNDays(7).map(d => new Date(d + 'T12:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 1))
    if (period === 'monthly') return rangeData.map(r => new Date(r.period + 'T12:00').toLocaleDateString('en', { day: 'numeric' }))
    return rangeData.map(r => new Date(r.period + '-01T12:00').toLocaleDateString('en', { month: 'short' }))
  })()

  const periodTitle    = { daily: 'Daily recap',   weekly: 'Weekly recap', monthly: 'Monthly recap', yearly: 'Yearly recap'   }[period]
  const periodSubtitle = { daily: 'How today felt.', weekly: 'Your momentum this week.', monthly: 'Your month at a glance.', yearly: 'A year of moments.' }[period]
  const chartHeading   = { daily: 'Last 7 days', weekly: 'Day by day', monthly: 'Day by day', yearly: 'Month by month' }[period]

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0 pb-24 md:pb-8 px-5 md:px-8">

        <div className="pt-6 pb-3">
          <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            {periodTitle}
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>{periodSubtitle}</p>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 pb-4 overflow-x-auto">
          {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-150"
              style={{
                background: period === p ? 'var(--gp)' : 'white',
                color: period === p ? 'white' : 'var(--tg)',
                border: period === p ? 'none' : '1px solid var(--border)',
                boxShadow: period === p ? 'var(--shadow-btn)' : 'var(--shadow-card)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {loading ? (
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
            <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <div className="skeleton h-3 w-24 mb-4" />
              <div className="flex items-end gap-2 h-20">
                {[60,40,80,55,70,45,90].map((h, i) => (
                  <div key={i} className="skeleton flex-1 rounded-lg" style={{ height: `${h}%` }} />
                ))}
              </div>
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
      </div>
      <BottomNav />
    </div>
  )
}