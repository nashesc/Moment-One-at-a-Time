'use client'

import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'
import MomentumRing from '@/components/ui/MomentumRing'
import TaskCard from '@/components/dashboard/TaskCard'
import DonePanel from '@/components/dashboard/DonePanel'
import FocusPickerModal from '@/components/dashboard/FocusPickerModal'

const MOCK_TASKS = [
  { id: '1', title: 'Review project proposal draft', description: 'Read through the Q3 proposal and leave comments for the team before end of day.', estimatedMinutes: 30, priority: 1 as const },
  { id: '2', title: 'Send weekly update email', description: 'Brief team on progress and blockers from this week.', estimatedMinutes: 15, priority: 2 as const },
  { id: '3', title: 'Organize research notes', description: 'Sort and tag notes from the last three interviews.', estimatedMinutes: 45, priority: 3 as const },
]

type TaskState = 'idle' | 'focusing' | 'done'

export default function DashboardPage() {
  const [showPicker, setShowPicker] = useState(true)
  const [focusedTask, setFocusedTask] = useState(MOCK_TASKS[0])
  const [taskState, setTaskState] = useState<TaskState>('idle')

  const now = new Date()
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
  const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  function handleMainBtn() {
    if (taskState === 'idle') {
      setTaskState('focusing')
    } else if (taskState === 'focusing') {
      setTaskState('done')
    } else {
      setTaskState('idle')
      setShowPicker(true)
    }
  }

  const btnLabel = taskState === 'idle' ? 'Begin focus' : taskState === 'focusing' ? 'Mark as done' : 'Next moment'
  const btnStyle = taskState === 'focusing'
    ? 'bg-[var(--blue-primary)] hover:bg-[#142d55]'
    : 'bg-[var(--green-primary)] hover:bg-[var(--green-forest)]'

  return (
    <div className="relative flex min-h-screen flex-col bg-[(--off-white)] pb-20">

      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-5 pb-2">
        <div>
          <p className="text-[12px] text-[(--text-gray)]">{dayName}, {monthDay}</p>
          <p className="text-[18px] text-[(--text-dark)]" style={{ fontFamily: '(--font-display)' }}>
            Good morning, Maria 🌿
          </p>
        </div>
        <Link
          href="/moments"
          className="rounded-full border border-[(--green-soft)] bg-white px-3 py-[5px] text-[12px] text-[(--green-forest)] no-underline"
        >
          View all
        </Link>
      </div>

      {/* Momentum ring */}
      <div className="flex flex-col items-center py-3">
        <MomentumRing done={3} total={4} size={84} />
      </div>

      {/* Task card */}
      <TaskCard
        title={focusedTask.title}
        description={focusedTask.description}
        estimatedMinutes={focusedTask.estimatedMinutes}
        priority={focusedTask.priority}
        isDone={taskState === 'done'}
      />

      {/* Done panel — inline, below card */}
      {taskState === 'done' && <DonePanel taskTitle={focusedTask.title} />}

      {/* Action buttons */}
      <div className="mt-3 px-5 flex flex-col gap-2">
        <button
          onClick={handleMainBtn}
          className={`w-full rounded-full py-[13px] text-[15px] font-medium text-white transition-colors ${btnStyle}`}
        >
          {btnLabel}
        </button>
        {taskState !== 'done' && (
          <div className="flex gap-2">
            <button className="flex-1 rounded-full border-[1.5px] border-[#ddd] bg-white py-[11px] text-[13px] text-[(--text-gray)] transition-colors hover:bg-[(--off-white)]">
              I&apos;m stuck
            </button>
            <button className="flex-1 rounded-full border-[1.5px] border-[#ddd] bg-white py-[11px] text-[13px] text-[(--text-gray)] transition-colors hover:bg-[(--off-white)]">
              Skip for now
            </button>
          </div>
        )}
      </div>

      {/* Focus picker modal */}
      {showPicker && (
        <FocusPickerModal
          tasks={MOCK_TASKS}
          onSelect={(task) => {
            setFocusedTask(task)
            setTaskState('idle')
            setShowPicker(false)
          }}
        />
      )}

      <BottomNav />
    </div>
  )
}