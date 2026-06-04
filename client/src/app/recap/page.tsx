'use client'

import { useState, useEffect, useCallback } from 'react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import MomentumRing from '@/components/ui/MomentumRing'
import { getRecap } from '@/lib/api'
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

// Returns the last N days as ISO strings, oldest first
function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

// Fetch multiple recaps safely — batched to stay under rate limit
async function fetchRecaps(dates: string[]): Promise<(Recap | null)[]> {
  const BATCH = 7
  const results: (Recap | null)[] = []
  for (let i = 0; i < dates.length; i += BATCH) {
    const batch = dates.slice(i, i + BATCH)
    const batchResults = await Promise.all(
      batch.map(d => getRecap(d).catch(() => null))
    )
    results.push(...batchResults)
    if (i + BATCH < dates.length) await new Promise(r => setTimeout(r, 150))
  }
  return results
}

function getDatesForPeriod(period: Period): string[] {
  const today = new Date()
  if (period === 'daily') return [today.toISOString().split('T')[0]]
  if (period === 'weekly') return getLastNDays(7)
  if (period === 'monthly') {
    // One day per week for the last 4 weeks
    return Array.from({ length: 4 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i * 7)
      return d.toISOString().split('T')[0]
    }).reverse()
  }
  // yearly: first of each of the last 12 months
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1)
    return d.toISOString().split('T')[0]
  })
}

function getChartLabels(period: Period): string[] {
  const now = new Date()
  if (period === 'daily')   return ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  if (period === 'weekly')  return getLastNDays(7).map(d => new Date(d + 'T12:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 1))
  if (period === 'monthly') return ['4w ago', '3w ago', '2w ago', 'This wk']
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].slice(
    (now.getMonth() + 1) % 12
  ).concat(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].slice(0, (now.getMonth() + 1) % 12))
}

export default function RecapPage() {
  const { doneTodayCount, totalTodayCount, todayTasks } = useTasks()
  const [period, setPeriod] = useState<Period>('daily')
  const [recaps, setRecaps] = useState<(Recap | null)[]>([])
  const [loading, setLoading] = useState(true)

  const loadRecaps = useCallback(async (p: Period) => {
    setLoading(true)
    try {
      const dates = getDatesForPeriod(p)
      const data  = await fetchRecaps(dates)
      setRecaps(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRecaps(period) }, [period, loadRecaps])

  // Aggregate across all recaps for the period
  const aggDone       = recaps.reduce((s, r) => s + (r?.tasks_done    ?? 0), 0)
  const aggTotal      = recaps.reduce((s, r) => s + (r?.tasks_total   ?? 0), 0)
  const aggStuck      = recaps.reduce((s, r) => s + (r?.tasks_stuck   ?? 0), 0)
  const aggSkipped    = recaps.reduce((s, r) => s + (r?.tasks_skipped ?? 0), 0)
  const aggInProgress = Math.max(0, aggTotal - aggDone - aggStuck - aggSkipped)

  // For daily, fall back to live context if API returned nothing
  const done       = period === 'daily' ? (recaps[0]?.tasks_done    ?? doneTodayCount)  : aggDone
  const total      = period === 'daily' ? (recaps[0]?.tasks_total   ?? totalTodayCount) : aggTotal
  const stuck      = period === 'daily' ? (recaps[0]?.tasks_stuck   ?? todayTasks.filter(t => t.status === 'stuck').length)   : aggStuck
  const skipped    = period === 'daily' ? (recaps[0]?.tasks_skipped ?? todayTasks.filter(t => t.status === 'skipped').length) : aggSkipped
  const inProgress = period === 'daily'
    ? Math.max(0, (recaps[0]?.tasks_total ?? totalTodayCount) - done - stuck - skipped)
    : aggInProgress

  const quote = QUOTES[done % QUOTES.length]

  // Build chart bars
  const chartLabels = getChartLabels(period)
  const chartBars   = period === 'daily'
    // daily: use last 7 days context bars (today real, others from available recaps)
    ? getLastNDays(7).map(d => {
        if (d === new Date().toISOString().split('T')[0]) {
          return total > 0 ? Math.round((done / total) * 100) : 0
        }
        return 0
      })
    : recaps.map(r => r && r.tasks_total > 0 ? Math.round((r.tasks_done / r.tasks_total) * 100) : 0)

  const periodTitle = {
    daily:   'Daily recap',
    weekly:  'Weekly recap',
    monthly: 'Monthly recap',
    yearly:  'Yearly recap',
  }[period]

  const periodSubtitle = {
    daily:   'How today felt.',
    weekly:  'Your momentum this week.',
    monthly: 'Your month at a glance.',
    yearly:  'A year of moments.',
  }[period]

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
            <button
              key={p}
              onClick={() => setPeriod(p)}
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
          <div className="rounded-2xl p-8 text-center" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <div className="w-8 h-8 rounded-full border-2 mx-auto mb-3 animate-spin"
              style={{ borderColor: 'var(--gpa)', borderTopColor: 'var(--gp)' }} />
            <p className="text-[14px]" style={{ color: 'var(--tg)' }}>Calculating your momentum...</p>
          </div>
        ) : total === 0 && period === 'daily' ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-4xl mb-4">🌱</p>
            <p className="text-[16px] font-medium" style={{ color: 'var(--td)' }}>No tasks today yet</p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>
              Add moments in the dashboard to track your day.
            </p>
          </div>
        ) : (
          <>
            {/* Ring + quote */}
            <motion.div
              className="rounded-2xl p-5 mb-4"
              style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <MomentumRing done={done} total={Math.max(total, 1)} size={90} showImage />
              <p className="mt-4 text-[15px] text-center italic"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}>
                &ldquo;{quote}&rdquo;
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 gap-3 mb-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.07, ease: [0.4, 0, 0.2, 1] }}
            >
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
          </>
        )}

        {/* Chart */}
        <motion.div
          className="rounded-2xl p-5"
          style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="moment-label">
              {period === 'daily' ? 'Last 7 days' : period === 'weekly' ? 'Day by day' : period === 'monthly' ? 'Week by week' : 'Month by month'}
            </p>
            {aggTotal === 0 && period !== 'daily' && (
              <p className="text-[10px]" style={{ color: 'var(--tgl)' }}>History builds over time</p>
            )}
          </div>
          <div className="flex items-end gap-2 h-20">
            {chartBars.map((pct, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5 h-full">
                <div className="flex-1 w-full rounded-lg overflow-hidden flex items-end"
                  style={{ background: 'var(--gpa)' }}>
                  <div
                    className="w-full rounded-lg"
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

      </div>
      <BottomNav />
    </div>
  )
}