import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import StatusBadge from '@/components/ui/StatusBadge'

const CHECKINS = [
  { id: '1', task: 'Morning journaling',  status: 'done' as const,  note: 'Started slow but ended up writing two full pages. Really grounding.',       time: 'Today · 8:14 AM'       },
  { id: '2', task: 'Deep work session',   status: 'stuck' as const, note: 'Too many notifications. Will try again tomorrow morning.',                    time: 'Yesterday · 2:30 PM'   },
  { id: '3', task: 'Review design specs', status: 'done' as const,  note: 'Took longer than expected but feels complete now.',                           time: 'Yesterday · 11:00 AM'  },
]

export default function ReflectionsPage() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0 pb-24 md:pb-8 px-5 md:px-8">
        <div className="pt-6 pb-4">
          <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>Reflections</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>How things felt, not just what was done.</p>
        </div>

        <div className="flex flex-col gap-3">
          {CHECKINS.map(({ id, task, status, note, time }) => (
            <div key={id} className="rounded-2xl p-5" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-[15px] font-semibold" style={{ color: 'var(--td)' }}>{task}</p>
                <StatusBadge status={status} />
              </div>
              <p className="text-[13px] leading-relaxed italic mb-3" style={{ color: 'var(--tg)' }}>"{note}"</p>
              <p className="text-[11px]" style={{ color: 'var(--tgl)' }}>{time}</p>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}