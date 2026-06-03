import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import StatusBadge from '@/components/ui/StatusBadge'
import { MessageSquare } from 'lucide-react'

const MOCK_CHECKINS = [
  { id: '1', task: 'Morning journaling',  status: 'done'  as const, note: 'Started slow but ended up writing two full pages. Really grounding.',  time: 'Today · 8:14 AM'      },
  { id: '2', task: 'Deep work session',   status: 'stuck' as const, note: 'Too many notifications. Will try again tomorrow morning.',              time: 'Yesterday · 2:30 PM'  },
  { id: '3', task: 'Review design specs', status: 'done'  as const, note: 'Took longer than expected but feels complete now.',                    time: 'Yesterday · 11:00 AM' },
]

export default function ReflectionsPage() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0 pb-24 md:pb-8 px-5 md:px-8">

        <div className="pt-6 pb-2">
          <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            Reflections
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>How things felt, not just what was done.</p>
        </div>

        <div className="rounded-2xl px-4 py-4 mb-5 mt-3 flex gap-3 items-start"
          style={{ background: '#EAF3DE', border: '1px solid #C0DD97' }}>
          <MessageSquare size={18} strokeWidth={1.75} color="var(--gp)" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--gp)' }}>
              What are Reflections?
            </p>
            <p className="text-[12px] leading-relaxed" style={{ color: '#3B6D11' }}>
              Every time you check in on a task — whether you finished it, got stuck, or noted how it felt — that entry appears here. Reflections are your personal log of how your work actually felt, not just whether it got done.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {MOCK_CHECKINS.map(({ id, task, status, note, time }) => (
            <div key={id} className="rounded-2xl p-5"
              style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-[15px] font-semibold" style={{ color: 'var(--td)' }}>{task}</p>
                <StatusBadge status={status} />
              </div>
              <p className="text-[13px] leading-relaxed italic mb-3" style={{ color: 'var(--tg)' }}>
                &ldquo;{note}&rdquo;
              </p>
              <p className="text-[11px]" style={{ color: 'var(--tgl)' }}>{time}</p>
            </div>
          ))}
        </div>

      </div>
      <BottomNav />
    </div>
  )
}