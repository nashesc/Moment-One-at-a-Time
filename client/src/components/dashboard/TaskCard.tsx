'use client'

import { Clock, Flag } from 'lucide-react'

interface TaskCardProps {
  title: string
  description?: string
  estimatedMinutes: number
  priority: 1 | 2 | 3
  isDone?: boolean
}

const priorityDot: Record<number, string> = {
  1: 'bg-[var(--green-sage)]',
  2: 'bg-[#C4A35A]',
  3: 'bg-[var(--blue-primary)]',
}
const priorityLabel: Record<number, string> = {
  1: 'High priority',
  2: 'Medium priority',
  3: 'Low priority',
}

export default function TaskCard({
  title, description, estimatedMinutes, priority, isDone = false
}: TaskCardProps) {
  return (
    <div className="mx-5 rounded-[18px] bg-white border border-[#e8e4dc] p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[priority]}`} />
        <span className="text-[11px] text-[(--text-gray)] uppercase tracking-wider">
          {priorityLabel[priority]}
        </span>
      </div>

      <div className="relative mb-2">
        <h2
          className="font-[(--font-display)] text-[20px] leading-snug text-[(--text-dark)] transition-colors duration-300"
          style={{
            fontFamily: '(--font-display)',
            color: isDone ? '(--text-gray)' : '(--text-dark)',
            textDecoration: isDone ? 'line-through' : 'none',
          }}
        >
          {title}
        </h2>
      </div>

      {!isDone && description && (
        <p className="text-[13px] text-[(--text-gray)] leading-relaxed mb-4">
          {description}
        </p>
      )}

      <div className="flex gap-2 flex-wrap">
        <span className="flex items-center gap-1 text-[11px] text-[(--text-gray)] bg-[(--off-white)] rounded-full px-3 py-1">
          <Clock size={12} strokeWidth={1.75} />
          {estimatedMinutes} min
        </span>
        <span className="flex items-center gap-1 text-[11px] text-[(--text-gray)] bg-[(--off-white)] rounded-full px-3 py-1">
          <Flag size={12} strokeWidth={1.75} />
          {priorityLabel[priority].split(' ')[0]}
        </span>
      </div>
    </div>
  )
}