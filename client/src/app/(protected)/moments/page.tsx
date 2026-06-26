'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, RefreshCw, Leaf } from 'lucide-react'
import TaskGridCard from '@/components/tasks/TaskGridCard'
import Toggle from '@/components/ui/Toggle'
import { useCreateTaskSheet } from '@/context/CreateTaskSheetContext'
import { useTasks, useActivateTasks } from '@/context/TaskContext'
import { useSettings } from '@/context/SettingsContext'
import { useMusic } from '@/context/MusicContext'
import { useFabOffset } from '@/hooks/useFabOffset'

const TABS = ['All', 'Pending', 'Done', 'Stuck'] as const
type Tab = typeof TABS[number]

export default function MomentsPage() {
  useActivateTasks()
  const { tasks, doneTodayCount, totalTodayCount, loading, error, refresh, updateStatus } = useTasks()
  const { prefs, setPref } = useSettings()
  const [tab, setTab]         = useState<Tab>('All')
  const { base, liftPx } = useFabOffset()
  const { currentTrack } = useMusic()
  const { openSheet } = useCreateTaskSheet()

  const TAB_INDEX: Record<Tab, number> = { All: 0, Pending: 1, Done: 2, Stuck: 3 }
  const contentRef = useRef<HTMLDivElement>(null)
  const prevTabRef = useRef<Tab>('All')

  const todayAll     = tasks.filter(t => t.date === 'Today')
  const yesterdayAll = tasks.filter(t => t.date === 'Yesterday')

  const todayFiltered     = filterByTab(todayAll).slice().reverse()
  const yesterdayFiltered = filterByTab(yesterdayAll).slice().reverse()
  const momentumPct       = totalTodayCount === 0 ? 0 : Math.round((doneTodayCount / totalTodayCount) * 100)
  
  function filterByTab(list: typeof tasks) {
    if (tab === 'Pending') return list.filter(t => t.status === 'pending' || t.status === 'in_progress')
    if (tab === 'Done')    return list.filter(t => t.status === 'done')
    if (tab === 'Stuck')   return list.filter(t => t.status === 'stuck')
    return list
  }

  useEffect(() => {
    if (tab === prevTabRef.current) return
    const dir = TAB_INDEX[tab] > TAB_INDEX[prevTabRef.current] ? 'right' : 'left'
    prevTabRef.current = tab
    const el = contentRef.current
    if (!el) return
    el.getAnimations().forEach(a => a.cancel())
    el.animate(
      [
        { transform: `translateX(${dir === 'right' ? 20 : -20}px)`, opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ],
      { duration: 180, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'both' }
    )
  }, [tab])

  return (
    <>
      <div className="flex flex-col flex-1 min-w-0 md:pb-16 moment-col--wide moment-col--center w-full"
        style={{ paddingBottom: currentTrack ? 200 : 152 }}
      >
        {/* Header */}
        <div className="px-5 md:px-8 pt-6 pb-2 flex items-center justify-between moment-sticky-header">
          <div>
            <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
              Moments
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--tg)' }}>All your tasks, past and present.</p>
          </div>
          {!loading && (
            <button
              onClick={refresh}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--gpa)', border: 'none', cursor: 'pointer' }}
              aria-label="Refresh"
            >
              <RefreshCw size={14} color="var(--gp)" />
            </button>
          )}
        </div>

        {/* Progress card */}
        {!loading && totalTodayCount > 0 && (
          <div
            className="mx-5 md:mx-8 mt-4 rounded-2xl px-5 py-4 mb-4 flex items-center justify-between"
            style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
          >
            <div>
              <p className="text-[13px] font-semibold" style={{ color: 'var(--gp)' }}>
                {doneTodayCount} of {totalTodayCount} completed
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--tg)' }}>
                {momentumPct}% momentum today
              </p>
            </div>
            <div className="flex-1 mx-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--gpa)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${momentumPct}%`, background: 'var(--gs)' }}
              />
            </div>
            <p className="text-[16px] font-bold shrink-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}>
              {momentumPct}%
            </p>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 px-5 md:px-8 pb-4 mt-2 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-150"
              style={{
                background: tab === t ? 'var(--gp)' : 'white',
                color: tab === t ? 'white' : 'var(--tg)',
                border: tab === t ? 'none' : '1px solid var(--border)',
                boxShadow: tab === t ? 'var(--shadow-btn)' : 'var(--shadow-card)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-2 px-5 md:px-8">
            <div className="skeleton h-3 w-12 mb-1 rounded" />
            {[0,1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
                style={{ background: 'white', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="skeleton w-[18px] h-[18px] rounded-full shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="skeleton h-3.5" style={{ width: `${50 + (i * 19) % 35}%` }} />
                  <div className="skeleton h-2.5 w-20" />
                </div>
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="mx-5 md:mx-8 rounded-2xl p-6 text-center"
            style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-[14px] mb-3" style={{ color: 'var(--tg)' }}>{error}</p>
            <button onClick={refresh}
              className="flex items-center gap-2 mx-auto text-[13px] px-4 py-2 rounded-full"
              style={{ background: 'var(--gpa)', color: 'var(--gp)', border: 'none', cursor: 'pointer' }}>
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}

        {/* Task groups */}
        {!loading && !error && (
          <div ref={contentRef} className="flex flex-col gap-4 px-5 md:px-8">
            {todayFiltered.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest pt-1 pb-2" style={{ color: 'var(--tg)' }}>
                  Today
                </p>
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                  {todayFiltered.map(t => (
                    <TaskGridCard
                      key={t.id}
                      title={t.title}
                      estimatedMinutes={t.estimatedMinutes}
                      priority={t.priority}
                      status={t.status}
                      onReactivate={() => updateStatus(t.id, 'pending')}
                    />
                  ))}
                </div>
              </div>
            )}
            {yesterdayFiltered.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest pt-3 pb-2" style={{ color: 'var(--tg)' }}>
                  Yesterday
                </p>
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                  {yesterdayFiltered.map(t => (
                    <TaskGridCard key={t.id} title={t.title} estimatedMinutes={t.estimatedMinutes} priority={t.priority} status={t.status} />
                  ))}
                </div>
              </div>
            )}
            {todayFiltered.length === 0 && yesterdayFiltered.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="flex justify-center mb-3">
                  <Leaf size={32} color="var(--gp)" strokeWidth={1.5} />
                </div>
                <p className="text-[15px] font-medium" style={{ color: 'var(--td)' }}>Nothing here</p>
                <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>
                  {tab === 'All' ? 'Tap + to add your first moment' : `No ${tab.toLowerCase()} tasks`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Always show one task toggle — wired to SettingsContext */}
        {!loading && !error && (
          <div
            className="mx-5 md:mx-8 mt-5 flex items-center justify-between rounded-2xl px-5 py-4"
            style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
          >
            <div>
              <p className="text-[14px] font-medium" style={{ color: 'var(--td)' }}>One task at a time</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--tg)' }}>Focus on a single moment on the dashboard</p>
            </div>
            <div className="ml-4 shrink-0">
              <Toggle
                on={prefs.oneTaskAtATime}
                onChange={(v) => setPref('oneTaskAtATime', v)}
                label="One task at a time"
              />
            </div>
          </div>
        )}

      </div>

      {/* FAB */}
      <button
        aria-label="Add task"
        onClick={() => openSheet()}
        className="fixed right-5 md:right-8 w-14 h-14 rounded-full text-white flex items-center justify-center z-40 will-change-transform active:scale-95"
        style={{
          background: 'var(--gp)',
          boxShadow: '0 4px 20px rgba(45,90,39,0.4), 0 2px 6px rgba(45,90,39,0.2)',
          bottom: base,                                    // static, no transition
          transform: currentTrack ? `translateY(-${liftPx}px)` : 'translateY(0)',
          transition: 'transform 0.3s var(--ease-out)',
        }}
      >
        <Plus size={24} strokeWidth={2} color="white" />
      </button>
    </>
  )
}