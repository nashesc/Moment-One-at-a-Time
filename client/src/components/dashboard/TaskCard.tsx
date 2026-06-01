'use client'

import { Clock } from 'lucide-react'

interface TaskCardProps {
  title: string
  description?: string
  estimatedMinutes: number
  priority: 1 | 2 | 3
  isDone?: boolean
}

const priorityConfig = {
  1: { dot: '#5A9E50', label: 'High Priority'   },
  2: { dot: '#C4A35A', label: 'Medium Priority' },
  3: { dot: '#1B3A6B', label: 'Low Priority'    },
}

export default function TaskCard({ title, description, estimatedMinutes, priority, isDone }: TaskCardProps) {
  const { dot, label } = priorityConfig[priority]

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--card)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: 'var(--tg)' }}>
        Your moment
      </p>

      <h2
        className="leading-tight mb-3 transition-colors duration-500"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 700,
          color: isDone ? 'var(--tg)' : 'var(--td)',
          /* single shorthand — no conflict */
          textDecoration: isDone ? `line-through var(--gs)` : 'none',
        }}
      >
        {title}
      </h2>

      {!isDone && description && (
        <p className="text-[14px] leading-relaxed mb-5" style={{ color: 'var(--tg)' }}>
          {description}
        </p>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--tg)' }}>
          <Clock size={13} strokeWidth={1.75} />
          {estimatedMinutes} min
        </span>
        <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--tg)' }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
          {label}
        </span>
      </div>
    </div>
  )
}