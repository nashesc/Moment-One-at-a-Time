'use client'

import { useState, useEffect } from 'react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import MomentumRing from '@/components/ui/MomentumRing'
import { getRecap } from '@/lib/api'
import { useTasks } from '@/context/TaskContext'
import type { Recap } from '@/types'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const QUOTES = [
  "Progress is still progress. Even the small ones.",
  "You showed up. That's everything.",
  "Every moment completed is a vote for the person you're becoming.",
  "Rest is part of the work.",
  "One step at a time — that's all it takes.",
]

export default function RecapPage() {
  const { doneTodayCount, totalTodayCount, todayTasks } = useTasks()
  const [recap, setRecap] = useState<Recap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only 1 API call — today's recap only
    // The 7-day chart needs a dedicated backend endpoint; using context data for now
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const todayStr = new Date().toISOString().split('T')[0]
        const data = await getRecap(todayStr)
        setRecap(data)
      } catch (err) {
        // If backend fails, fall back to context data silently
        setError(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Use recap data if available, fall back to live context counts
  const done       = recap?.tasks_done       ?? doneTodayCount
  const total      = recap?.tasks_total      ?? totalTodayCount
  const stuck      = recap?.tasks_stuck      ?? todayTasks.filter(t => t.status === 'stuck').length
  const skipped    = recap?.tasks_skipped    ?? todayTasks.filter(t => t.status === 'skipped').length
  const inProgress = Math.max(0, total - done - stuck - skipped)
  const quote      = QUOTES[done % QUOTES.length]

  // Week chart — uses context-derived data for today, placeholder for history
  // TODO: replace with GET /api/recap/week when endpoint is added
  const todayPct = total > 0 ? Math.round((done / total) * 100) : 0
  const weekData = [0, 0, 0, 0, 0, 0, todayPct] // only today is real; rest are placeholders

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0 pb-24 md:pb-8 px-5 md:px-8">

        <div className="pt-6 pb-4">
          <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            Daily recap
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>How today felt.</p>
        </div>

        {loading ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <div className="w-8 h-8 rounded-full border-2 mx-auto mb-3 animate-spin"
              style={{ borderColor: 'var(--gpa)', borderTopColor: 'var(--gp)' }} />
            <p className="text-[14px]" style={{ color: 'var(--tg)' }}>Calculating your momentum...</p>
          </div>
        ) : total === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-4xl mb-4">🌱</p>
            <p className="text-[16px] font-medium" style={{ color: 'var(--td)' }}>No tasks today yet</p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>
              Add moments in the dashboard to track your day.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl p-5 mb-4" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <MomentumRing done={done} total={total} size={90} showImage />
              <p className="mt-4 text-[15px] text-center italic"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}>
                &ldquo;{quote}&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
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
            </div>
          </>
        )}

        {/* 7-day chart */}
        <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--tg)' }}>Last 7 days</p>
            <p className="text-[10px]" style={{ color: 'var(--tgl)' }}>History loads after more days</p>
          </div>
          <div className="flex items-end gap-2 h-20">
            {weekData.map((pct, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5 h-full">
                <div className="flex-1 w-full rounded-lg overflow-hidden flex items-end"
                  style={{ background: 'var(--gpa)' }}>
                  <div
                    className="w-full rounded-lg transition-all duration-700"
                    style={{
                      height: `${Math.max(pct, 4)}%`,
                      background: pct > 0 ? 'var(--gs)' : 'var(--gpa)',
                    }}
                  />
                </div>
                <span className="text-[10px]" style={{ color: 'var(--tg)' }}>{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  )
}