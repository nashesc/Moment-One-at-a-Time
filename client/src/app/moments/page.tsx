'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'
import TaskRow from '@/components/tasks/TaskRow'

const ALL_TASKS = [
  { id: '1', title: 'Morning journaling', date: 'Today', estimatedMinutes: 15, status: 'done' as const },
  { id: '2', title: 'Review project proposal draft', date: 'Today', estimatedMinutes: 30, status: 'in_progress' as const },
  { id: '3', title: 'Send weekly update email', date: 'Today', estimatedMinutes: 15, status: 'pending' as const },
  { id: '4', title: 'Organize research notes', date: 'Yesterday', estimatedMinutes: 45, status: 'stuck' as const },
  { id: '5', title: 'Update team on blockers', date: 'Yesterday', estimatedMinutes: 10, status: 'done' as const },
]

const TABS = ['All', 'Pending', 'Done', 'Stuck'] as const
type Tab = typeof TABS[number]

export default function MomentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('All')

  const filtered = ALL_TASKS.filter(t => {
    if (activeTab === 'All') return true
    if (activeTab === 'Pending') return t.status === 'pending'
    if (activeTab === 'Done') return t.status === 'done'
    if (activeTab === 'Stuck') return t.status === 'stuck'
    return true
  })

  return (
    <div className="relative flex min-h-screen flex-col bg-[(--off-white)] pb-20">
      <div className="px-6 pt-5 pb-2">
        <h1 className="text-[24px] text-[(--text-dark)]" style={{ fontFamily: '(--font-display)' }}>Moments</h1>
        <p className="text-[13px] text-[(--text-gray)] mt-1">All your tasks, past and present.</p>
      </div>

      <div className="flex gap-2 px-6 pb-3 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap rounded-full border-[1.5px] px-3 py-[5px] text-[12px] transition-colors ${
              activeTab === tab
                ? 'border-[(--green-primary)] bg-[(--green-primary)] text-white'
                : 'border-[#ddd] bg-white text-[(--text-gray)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 px-5">
        {filtered.map(task => (
          <TaskRow
            key={task.id}
            title={task.title}
            date={task.date}
            estimatedMinutes={task.estimatedMinutes}
            status={task.status}
          />
        ))}
      </div>

      <button
        aria-label="Add task"
        className="fixed bottom-24 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-[(--green-primary)] text-white shadow-lg transition-transform hover:scale-105"
      >
        <Plus size={22} strokeWidth={2} />
      </button>

      <BottomNav />
    </div>
  )
}