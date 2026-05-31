interface MomentumRingProps {
  done: number
  total: number
  size?: number
}

export default function MomentumRing({ done, total, size = 84 }: MomentumRingProps) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--green-pale)" strokeWidth="7"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--green-sage)" strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x={size / 2} y={size / 2 + 5}
          textAnchor="middle"
          fontFamily="'Playfair Display', serif"
          fontSize={size > 90 ? 20 : 16}
          fontWeight="600"
          fill="var(--text-dark)"
        >
          {pct}%
        </text>
      </svg>
      <p className="mt-1 text-xs text-[var(--text-gray)]">
        {done} of {total} moments completed
      </p>
    </div>
  )
}