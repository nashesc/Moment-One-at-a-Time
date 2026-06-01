'use client'

import { CheckCircle2, Clock } from 'lucide-react'

interface Task {
  id: string
  title: string
  estimatedMinutes: number
  priority: 1 | 2 | 3
}

const priorityLabel = { 1: 'High', 2: 'Medium', 3: 'Low' }
const priorityDot   = { 1: '#5A9E50', 2: '#C4A35A', 3: '#1B3A6B' }

export default function FocusPickerModal({ tasks, onSelect }: { tasks: Task[]; onSelect: (t: Task) => void }) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col px-5 pt-8 pb-6 overflow-y-auto"
      style={{ background: 'rgba(245,242,236,0.97)', backdropFilter: 'blur(8px)' }}
    >
      <h2
        className="text-[22px] font-bold mb-1"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}
      >
        Choose your next moment
      </h2>
      <p className="text-[13px] mb-6" style={{ color: 'var(--tg)' }}>
        Select a task to focus on.
      </p>

      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => onSelect(task)}
            className="w-full flex items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all duration-150"
            style={{
              background: 'white',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
              cursor: 'pointer',
            }}
          >
            <CheckCircle2 size={20} strokeWidth={1.5} color="var(--gso)" className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium truncate" style={{ color: 'var(--td)' }}>
                {task.title}
              </p>
              <p className="text-[12px] mt-0.5 flex items-center gap-2" style={{ color: 'var(--tg)' }}>
                <span className="flex items-center gap-1">
                  <Clock size={11} strokeWidth={1.75} />
                  {task.estimatedMinutes} min
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: priorityDot[task.priority] }} />
                  {priorityLabel[task.priority]}
                </span>
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}