'use client'

import { useEffect, useState } from 'react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import StatusBadge from '@/components/ui/StatusBadge'
import { MessageSquare } from 'lucide-react'
import { getCheckins } from '@/lib/api'
import type { Checkin } from '@/types'

function formatCheckinTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const todayStr = now.toDateString()
  const checkinStr = d.toDateString()

  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  if (checkinStr === todayStr) return `Today · ${timeStr}`

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (checkinStr === yesterday.toDateString()) return `Yesterday · ${timeStr}`

  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${timeStr}`
}

// Map checkin status to badge status
function toBadgeStatus(status: Checkin['status']): 'done' | 'stuck' | 'in_progress' | 'pending' | 'skipped' {
  if (status === 'done') return 'done'
  if (status === 'stuck') return 'stuck'
  if (status === 'on_track') return 'in_progress'
  if (status === 'skipped') return 'skipped'
  return 'pending'
}

export default function ReflectionsPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Guard: skip fetch if no session (avoids burning rate limit on auth pages)
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setLoading(false); return }

        const data = await getCheckins()
        setCheckins(data)
      } catch {
        setError('Could not load reflections. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0 pb-24 md:pb-8 px-5 md:px-8">

        <div className="pt-6 pb-2">
          <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            Reflections
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>How things felt, not just what was done.</p>
        </div>

        <div className="rounded-2xl px-4 py-4 mb-5 mt-3 flex gap-3 items-start"
          style={{ background: '#EAF3DE', border: '1px solid #C0DD97' }}>
          <MessageSquare size={18} strokeWidth={1.75} color="var(--gp)" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--gp)' }}>
              What are Reflections?
            </p>
            <p className="text-[12px] leading-relaxed" style={{ color: '#3B6D11' }}>
              Every time you check in on a task — whether you finished it, got stuck, or noted how it felt — that entry appears here. Reflections are your personal log of how your work actually felt, not just whether it got done.
            </p>
          </div>
        </div>

        {loading ? (
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
        ) : error ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-[14px]" style={{ color: 'var(--tg)' }}>{error}</p>
          </div>
        ) : checkins.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-4xl mb-4">🌿</p>
            <p className="text-[16px] font-medium mb-1" style={{ color: 'var(--td)' }}>No reflections yet</p>
            <p className="text-[13px]" style={{ color: 'var(--tg)' }}>
              As you work through tasks — completing, getting stuck, or noting how things felt — your reflections will appear here.
            </p>
          </div>
        ) : (
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

                {checkin.notes && (
                  <p className="text-[13px] leading-relaxed italic mb-3" style={{ color: 'var(--tg)' }}>
                    &ldquo;{checkin.notes}&rdquo;
                  </p>
                )}

                {!checkin.notes && !checkin.stuck_reason && (
                  <p className="text-[13px] italic mb-3" style={{ color: 'var(--tgl)' }}>
                    No notes added.
                  </p>
                )}

                <p className="text-[11px]" style={{ color: 'var(--tgl)' }}>
                  {formatCheckinTime(checkin.checked_at)}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}