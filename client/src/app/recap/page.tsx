import BottomNav from '@/components/ui/BottomNav'
import MomentumRing from '@/components/ui/MomentumRing'

const WEEK_DATA = [50, 80, 40, 90, 60, 30, 75]
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function RecapPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[(--off-white)] pb-20">
      <div className="px-6 pt-5 pb-2">
        <h1 className="text-[24px] text-[(--text-dark)]" style={{ fontFamily: '(--font-display)' }}>Daily recap</h1>
        <p className="text-[13px] text-[(--text-gray)] mt-1">How today felt.</p>
      </div>

      <div className="flex flex-col items-center py-4">
        <MomentumRing done={3} total={4} size={110} />
        <p className="mt-3 max-w-[220px] text-center text-[15px] leading-relaxed text-[(--green-primary)] italic" style={{ fontFamily: '(--font-display)' }}>
          "Progress is still progress. Even the small ones."
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 px-5 pb-4">
        {[
          { num: 3, label: 'Completed', color: '#27500A' },
          { num: 1, label: 'In progress', color: '#0C447C' },
          { num: 0, label: 'Stuck', color: '#633806' },
          { num: 0, label: 'Skipped', color: '#5F5E5A' },
        ].map(({ num, label, color }) => (
          <div key={label} className="rounded-[13px] bg-white border border-[#eee] px-4 py-3 text-center">
            <p className="text-[26px]" style={{ fontFamily: '(--font-display)', color }}>{num}</p>
            <p className="text-[11px] text-[(--text-gray)] mt-[2px]">{label}</p>
          </div>
        ))}
      </div>

      <div className="px-5">
        <p className="text-[11px] text-[(--text-gray)] uppercase tracking-wider mb-2">Last 7 days</p>
        <div className="flex items-end gap-2 h-16">
          {WEEK_DATA.map((pct, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1 h-full">
              <div className="flex-1 w-full rounded bg-[(--green-pale)] flex items-end">
                <div
                  className="w-full rounded bg-[(--green-sage)]"
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-[(--text-gray)]">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}