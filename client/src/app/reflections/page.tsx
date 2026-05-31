import BottomNav from '@/components/ui/BottomNav'
import StatusBadge from '@/components/ui/StatusBadge'

const CHECKINS = [
  { id: '1', task: 'Morning journaling', status: 'done' as const, note: 'Started slow but ended up writing two full pages. Really grounding.', time: 'Today · 8:14 AM' },
  { id: '2', task: 'Deep work session', status: 'stuck' as const, note: 'Too many notifications. Will try again tomorrow morning.', time: 'Yesterday · 2:30 PM' },
  { id: '3', task: 'Review design specs', status: 'done' as const, note: 'Took longer than expected but feels complete now.', time: 'Yesterday · 11:00 AM' },
]

export default function ReflectionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[(--off-white)] pb-20">
      <div className="px-6 pt-5 pb-4">
        <h1 className="text-[24px] text-[(--text-dark)]" style={{ fontFamily: '(--font-display)' }}>Reflections</h1>
        <p className="text-[13px] text-[(--text-gray)] mt-1">How things felt, not just what was done.</p>
      </div>

      <div className="flex flex-col gap-2 px-5">
        {CHECKINS.map(({ id, task, status, note, time }) => (
          <div key={id} className="rounded-[13px] bg-white border border-[#eee] px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] font-medium text-[(--text-dark)]">{task}</span>
              <StatusBadge status={status} />
            </div>
            <p className="text-[12px] text-[(--text-gray)] leading-relaxed italic">"{note}"</p>
            <p className="mt-2 text-[11px] text-[(--text-gray)]">{time}</p>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}