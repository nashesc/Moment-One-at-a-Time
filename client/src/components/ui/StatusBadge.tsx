type Status = 'pending' | 'in_progress' | 'done' | 'stuck' | 'skipped'

const cfg: Record<Status, { bg: string; color: string; label: string }> = {
  pending:     { bg: '#F0EFE8', color: '#888780', label: 'Pending'     },
  in_progress: { bg: '#E6F1FB', color: '#185FA5', label: 'In Progress' },
  done:        { bg: '#EAF3DE', color: '#3B6D11', label: 'Done'        },
  stuck:       { bg: '#FAEEDA', color: '#854F0B', label: 'Stuck'       },
  skipped:     { bg: '#F5F3EF', color: '#9B9B9B', label: 'Skipped'     },
}

export default function StatusBadge({ status }: { status: Status }) {
  const { bg, color, label } = cfg[status]
  return (
    <span
      className="inline-flex items-center text-[11px] font-medium px-2 py-[3px] rounded-full whitespace-nowrap"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  )
}