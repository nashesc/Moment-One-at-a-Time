'use client'

import { ChevronRight } from 'lucide-react'

interface Task {
  id: string
  title: string
  estimatedMinutes: number
  priority: 1 | 2 | 3
}

interface FocusPickerModalProps {
  tasks: Task[]
  onSelect: (task: Task) => void
}

const priorityLabel: Record<number, string> = { 1: 'High', 2: 'Medium', 3: 'Low' }

export default function FocusPickerModal({ tasks, onSelect }: FocusPickerModalProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[rgba(245,242,236,0.94)] backdrop-blur-sm px-5 pt-6 pb-4 overflow-y-auto">
      <h2
        className="text-[20px] text-[(--text-dark)] mb-1"
        style={{ fontFamily: '(--font-display)' }}
      >
        Choose your next moment
      </h2>
      <p className="text-[13px] text-[(--text-gray)] mb-5">
        What do you want to focus on first?
      </p>

      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => onSelect(task)}
            className="w-full flex justify-between items-center bg-white rounded-[13px] border border-[#eee] px-4 py-3 text-left transition-colors hover:border-[(--green-soft)] cursor-pointer"
          >
            <div>
              <p className="text-[14px] font-medium text-[(--text-dark)]">{task.title}</p>
              <p className="text-[11px] text-[(--text-gray)] mt-[2px]">
                {task.estimatedMinutes} min · {priorityLabel[task.priority]} priority
              </p>
            </div>
            <ChevronRight size={18} className="text-[(--green-soft)]" strokeWidth={1.75} />
          </button>
        ))}
      </div>
    </div>
  )
}