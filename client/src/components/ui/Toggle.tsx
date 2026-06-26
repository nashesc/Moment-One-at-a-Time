'use client'

interface ToggleProps {
  on: boolean
  onChange?: (v: boolean) => void
  label: string
}

export default function Toggle({ on, onChange, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange?.(!on)}
      className="relative shrink-0 rounded-full border-none cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        width: 44,
        height: 24,
        background: on ? 'var(--gs)' : '#D1D1D1',
        boxShadow: on ? '0 2px 8px rgba(90,158,80,0.35)' : 'none',
        transition: 'background 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <span
        className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm"
        style={{
          left: on ? 'calc(100% - 21px)' : '3px',
          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </button>
  )
}