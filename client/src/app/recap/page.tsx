import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import MomentumRing from '@/components/ui/MomentumRing'

const WEEK = [50, 80, 40, 90, 60, 30, 75]
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function RecapPage() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0 pb-24 md:pb-8 px-5 md:px-8">

        <div className="pt-6 pb-4">
          <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>Daily recap</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>How today felt.</p>
        </div>

        <div className="rounded-2xl p-5 mb-4" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
          <MomentumRing done={3} total={4} size={90} showImage />
          <p className="mt-4 text-[15px] italic text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}>
            "Progress is still progress. Even the small ones."
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { n: 3, label: 'Completed',   color: '#3B6D11' },
            { n: 1, label: 'In Progress', color: '#185FA5' },
            { n: 0, label: 'Stuck',       color: '#854F0B' },
            { n: 0, label: 'Skipped',     color: '#888780' },
          ].map(({ n, label, color }) => (
            <div key={label} className="rounded-2xl p-4 text-center" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <p className="text-[28px] font-bold" style={{ fontFamily: 'var(--font-display)', color }}>{n}</p>
              <p className="text-[12px] mt-1" style={{ color: 'var(--tg)' }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
          <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: 'var(--tg)' }}>Last 7 days</p>
          <div className="flex items-end gap-2 h-20">
            {WEEK.map((pct, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5 h-full">
                <div className="flex-1 w-full rounded-lg overflow-hidden flex items-end" style={{ background: 'var(--gpa)' }}>
                  <div className="w-full rounded-lg" style={{ height: `${pct}%`, background: 'var(--gs)', transition: 'height 0.6s ease' }} />
                </div>
                <span className="text-[10px]" style={{ color: 'var(--tg)' }}>{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}