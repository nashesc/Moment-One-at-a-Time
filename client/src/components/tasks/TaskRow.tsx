import StatusBadge from '@/components/ui/StatusBadge'

type Status = 'pending' | 'in_progress' | 'done' | 'stuck' | 'skipped'

interface TaskRowProps {
  title: string
  date: string
  estimatedMinutes: number
  status: Status
  onClick?: () => void
}

export default function TaskRow({ title, date, estimatedMinutes, status, onClick }: TaskRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-white rounded-[13px] border border-[#eee] px-4 py-3 text-left cursor-pointer transition-colors hover:border-[(--green-soft)]"
    >
      <div className="flex-1">
        <p className="text-[14px] font-medium text-[(--text-dark)]">{title}</p>
        <p className="text-[11px] text-[(--text-gray)] mt-[2px]">
          {date} · {estimatedMinutes} min
        </p>
      </div>
      <StatusBadge status={status} />
    </button>
  )
}