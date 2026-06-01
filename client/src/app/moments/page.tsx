'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import TaskRow from '@/components/tasks/TaskRow'

const TASKS = [
  { id: '1', title: 'Write content for features section', date: 'Today',     estimatedMinutes: 45, priority: 2 as const, status: 'pending' as const },
  { id: '2', title: 'Design the landing page',            date: 'Today',     estimatedMinutes: 60, priority: 1 as const, status: 'in_progress' as const },
  { id: '3', title: 'Test the onboarding flow',           date: 'Today',     estimatedMinutes: 30, priority: 2 as const, status: 'pending' as const },
  { id: '4', title: 'Prepare design system',              date: 'Today',     estimatedMinutes: 80, priority: 1 as const, status: 'stuck' as const },
  { id: '5', title: 'Plan tomorrow\'s priorities',        date: 'Today',     estimatedMinutes: 20, priority: 3 as const, status: 'pending' as const },
  { id: '6', title: 'Morning journaling',                 date: 'Yesterday', estimatedMinutes: 15, priority: 3 as const, status: 'done' as const },
  { id: '7', title: 'Review design specs',                date: 'Yesterday', estimatedMinutes: 40, priority: 2 as const, status: 'done' as const },
  { id: '8', title: 'Update team on blockers',            date: 'Yesterday', estimatedMinutes: 10, priority: 2 as const, status: 'done' as const },
]

const TABS = ['All', 'Pending', 'Done', 'Stuck'] as const
type Tab = typeof TABS[number]

export default function MomentsPage() {
  const [tab, setTab] = useState<Tab>('All')

  const filtered = TASKS.filter(t => {
    if (tab === 'Pending') return t.status === 'pending'
    if (tab === 'Done')    return t.status === 'done'
    if (tab === 'Stuck')   return t.status === 'stuck'
    return true
  })

  const todayTasks  = filtered.filter(t => t.date === 'Today')
  const otherTasks  = filtered.filter(t => t.date !== 'Today')

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />

      <div className="flex flex-col flex-1 min-w-0 pb-24 md:pb-8">
        <div className="px-5 md:px-8 pt-6 pb-2">
          <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            Moments
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>All your tasks, past and present.</p>
        </div>

        {/* Progress summary */}
        <div
          className="mx-5 md:mx-8 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3"
          style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-[13px] font-medium" style={{ color: 'var(--gp)' }}>Progress</p>
          <p className="text-[13px]" style={{ color: 'var(--tg)' }}>3 of 5 completed</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-5 md:px-8 pb-4 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-150"
              style={{
                background: tab === t ? 'var(--gp)' : 'white',
                color: tab === t ? 'white' : 'var(--tg)',
                border: tab === t ? 'none' : '1px solid var(--border)',
                boxShadow: tab === t ? 'none' : 'var(--shadow-card)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Task groups */}
        <div className="flex flex-col gap-2 px-5 md:px-8">
          {todayTasks.length > 0 && (
            <>
              <p className="text-[11px] uppercase tracking-widest pt-1 pb-1" style={{ color: 'var(--tg)' }}>Today</p>
              {todayTasks.map(t => <TaskRow key={t.id} {...t} />)}
            </>
          )}
          {otherTasks.length > 0 && (
            <>
              <p className="text-[11px] uppercase tracking-widest pt-3 pb-1" style={{ color: 'var(--tg)' }}>Yesterday</p>
              {otherTasks.map(t => <TaskRow key={t.id} {...t} />)}
            </>
          )}
        </div>

        {/* Always show one task toggle */}
        <div
          className="mx-5 md:mx-8 mt-5 flex items-center justify-between rounded-2xl px-4 py-4"
          style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-[14px]" style={{ color: 'var(--td)' }}>Always show one task at a time</p>
          <button
            className="relative w-11 h-6 rounded-full transition-colors duration-200"
            style={{ background: 'var(--gs)', border: 'none', cursor: 'pointer' }}
          >
            <span className="absolute top-[3px] left-[calc(100%-21px)] w-[18px] h-[18px] rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </div>

      {/* FAB */}
      <button
        aria-label="Add task"
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 w-12 h-12 rounded-full text-white flex items-center justify-center transition-transform hover:scale-105 z-40"
        style={{ background: 'var(--gp)', boxShadow: '0 4px 16px rgba(45,90,39,.3)' }}
      >
        <Plus size={22} strokeWidth={2} color="white" />
      </button>

      <BottomNav />
    </div>
  )
}