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
      <div
        className="relative shrink-0"
        style={{ animation: 'breathe 5s ease-in-out infinite', transformOrigin: 'center' }}
      >
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
          className="hidden lg:block ml-auto rounded-2xl overflow-hidden w-36 h-24 shrink-0"
          style={{ boxShadow: '0 2px 12px rgba(45,90,39,0.1)' }}
        >
          <svg viewBox="0 0 144 96" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="sky-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#c8e8f5" />
                <stop offset="55%"  stopColor="#dff0e8" />
                <stop offset="100%" stopColor="#eef6ea" />
              </linearGradient>
              <linearGradient id="mt-far" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#a8c5b8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#c4dbc8" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="mt-mid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#6a9e78" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#8ab890" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="mt-near" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#4a7a5a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#6a9e72" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#98c49e" />
                <stop offset="100%" stopColor="#b8d8bc" />
              </linearGradient>
              <filter id="soft" x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="softer">
                <feGaussianBlur stdDeviation="2.5" />
              </filter>
            </defs>

            {/* Sky */}
            <rect width="144" height="96" fill="url(#sky-g)" />

            {/* Atmospheric haze */}
            <ellipse cx="72" cy="55" rx="80" ry="30" fill="white" opacity="0.18" filter="url(#softer)" />

            {/* Far mountains — very soft */}
            <polygon points="0,65 20,38 40,65" fill="url(#mt-far)" filter="url(#soft)" />
            <polygon points="25,65 50,30 75,65" fill="url(#mt-far)" filter="url(#soft)" />
            <polygon points="60,65 90,35 118,65" fill="url(#mt-far)" filter="url(#soft)" />
            <polygon points="100,65 130,40 144,65" fill="url(#mt-far)" filter="url(#soft)" />

            {/* Mid mountains */}
            <polygon points="0,72 28,45 56,72" fill="url(#mt-mid)" />
            <polygon points="35,72 68,32 100,72" fill="url(#mt-mid)" />
            <polygon points="85,72 118,42 144,72" fill="url(#mt-mid)" />

            {/* Snow caps */}
            <polygon points="68,32 64,44 72,44" fill="white" opacity="0.7" />
            <polygon points="28,45 25,53 31,53" fill="white" opacity="0.5" />

            {/* Near foreground hills */}
            <polygon points="0,82 30,62 60,82" fill="url(#mt-near)" />
            <polygon points="50,82 90,58 130,82" fill="url(#mt-near)" />
            <polygon points="110,82 144,65 144,82" fill="url(#mt-near)" />

            {/* Meadow foreground */}
            <rect x="0" y="80" width="144" height="16" fill="url(#meadow)" />
            {/* Subtle grass blades */}
            <line x1="20" y1="80" x2="18" y2="74" stroke="#6a9e72" strokeWidth="1" opacity="0.5" />
            <line x1="40" y1="80" x2="42" y2="73" stroke="#6a9e72" strokeWidth="1" opacity="0.4" />
            <line x1="70" y1="80" x2="68" y2="75" stroke="#6a9e72" strokeWidth="1" opacity="0.5" />
            <line x1="100" y1="80" x2="102" y2="74" stroke="#6a9e72" strokeWidth="1" opacity="0.4" />
            <line x1="125" y1="80" x2="123" y2="76" stroke="#6a9e72" strokeWidth="1" opacity="0.5" />

            {/* Soft clouds */}
            <ellipse cx="30" cy="18" rx="14" ry="5" fill="white" opacity="0.55" filter="url(#soft)" />
            <ellipse cx="44" cy="16" rx="10" ry="4" fill="white" opacity="0.45" filter="url(#soft)" />
            <ellipse cx="100" cy="12" rx="16" ry="5" fill="white" opacity="0.5"  filter="url(#soft)" />
            <ellipse cx="116" cy="11" rx="10" ry="3.5" fill="white" opacity="0.4" filter="url(#soft)" />

            {/* Tiny birds */}
            <path d="M55 20 Q57 18 59 20" stroke="rgba(74,122,90,0.5)" strokeWidth="0.8" fill="none" />
            <path d="M62 17 Q64 15 66 17" stroke="rgba(74,122,90,0.4)" strokeWidth="0.8" fill="none" />
          </svg>
        </div>
      )}
    </div>
  )
}