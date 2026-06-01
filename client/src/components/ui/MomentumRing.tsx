interface MomentumRingProps {
  done: number
  total: number
  size?: number
  showImage?: boolean
}

export default function MomentumRing({ done, total, size = 80, showImage = false }: MomentumRingProps) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const r = (size / 2) - 7
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex items-center gap-4">
      {/* Ring */}
      <div className="relative shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--gpa)" strokeWidth="6" />
          <circle
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke="var(--gs)"
            strokeWidth="6"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-[16px] font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}
          >
            {pct}%
          </span>
        </div>
      </div>

      {/* Stats text */}
      <div>
        <p className="text-[16px] font-semibold leading-snug" style={{ color: 'var(--td)' }}>
          {done} of {total} moments completed
        </p>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--tg)' }}>
          You&apos;re building momentum beautifully.
        </p>
      </div>

      {/* Mountain image — desktop only */}
      {showImage && (
        <div
          className="hidden lg:block ml-auto rounded-2xl overflow-hidden w-32 h-20 shrink-0"
          style={{ background: 'linear-gradient(135deg, #c8dfc5 0%, #e8f3e5 50%, #f0f7ee 100%)' }}
        >
          <svg viewBox="0 0 128 80" className="w-full h-full" style={{ opacity: 0.7 }}>
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4e8f0"/>
                <stop offset="100%" stopColor="#e8f3e5"/>
              </linearGradient>
              <linearGradient id="mt1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5a8f6e"/>
                <stop offset="100%" stopColor="#7aaa87"/>
              </linearGradient>
              <linearGradient id="mt2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a8c5a0"/>
                <stop offset="100%" stopColor="#c8dfc5"/>
              </linearGradient>
            </defs>
            <rect width="128" height="80" fill="url(#sky)"/>
            <polygon points="0,60 25,20 50,60" fill="url(#mt1)" opacity="0.8"/>
            <polygon points="30,60 60,15 90,60" fill="url(#mt1)" opacity="0.9"/>
            <polygon points="70,60 100,25 128,60" fill="url(#mt2)" opacity="0.7"/>
            <rect x="0" y="60" width="128" height="20" fill="#c8dfc5" opacity="0.6"/>
            <ellipse cx="64" cy="22" rx="18" ry="6" fill="white" opacity="0.4"/>
            <ellipse cx="30" cy="18" rx="12" ry="4" fill="white" opacity="0.3"/>
          </svg>
        </div>
      )}
    </div>
  )
}