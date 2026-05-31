type Status = 'pending' | 'in_progress' | 'done' | 'stuck' | 'skipped'

const styles: Record<Status, string> = {
  pending: 'bg-[#f0efe8] text-[#5F5E5A]',
  in_progress: 'bg-[#e6f1fb] text-[#0C447C]',
  done: 'bg-[#eaf3de] text-[#27500A]',
  stuck: 'bg-[#faeeda] text-[#633806]',
  skipped: 'bg-[#f5f3ef] text-[#888780] italic',
}

const labels: Record<Status, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  done: 'Done',
  stuck: 'Stuck',
  skipped: 'Skipped',
}

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`text-[11px] font-medium px-2 py-[3px] rounded-full whitespace-nowrap ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}