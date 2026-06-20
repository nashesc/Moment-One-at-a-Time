'use client'

import { CheckCircle2, AlertCircle, ArrowRight, Clock } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'

type Status = 'pending' | 'in_progress' | 'done' | 'stuck' | 'skipped'

const StatusIcon = ({ status }: { status: Status }) => {
  if (status === 'done')        return <CheckCircle2 size={16} strokeWidth={1.75} color="#3B6D11" />
  if (status === 'stuck')       return <AlertCircle  size={16} strokeWidth={1.75} color="#854F0B" />
  if (status === 'in_progress') return <ArrowRight   size={16} strokeWidth={1.75} color="#185FA5" />
  return <div className="w-[16px] h-[16px] rounded-full border-[1.5px]" style={{ borderColor: '#D1D1D1' }} />
}

interface TaskGridCardProps {
  title: string
  estimatedMinutes: number
  priority: 1 | 2 | 3
  status: Status
}

const priorityDot = { 1: '#5A9E50', 2: '#C4A35A', 3: '#1B3A6B' }

export default function TaskGridCard({ title, estimatedMinutes, priority, status }: TaskGridCardProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-4 h-full"
      style={{ background: 'white', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <StatusIcon status={status} />
        <StatusBadge status={status} />
      </div>
      <p className="text-[14px] font-medium leading-snug"
        style={{ color: status === 'done' ? 'var(--tg)' : 'var(--td)', textDecoration: status === 'done' ? 'line-through' : 'none' }}>
        {title}
      </p>
      <p className="text-[11px] mt-auto flex items-center gap-1.5" style={{ color: 'var(--tgl)' }}>
        <Clock size={10} strokeWidth={1.75} />
        {estimatedMinutes} min
        <span>·</span>
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: priorityDot[priority] }} />
      </p>
    </div>
  )
}