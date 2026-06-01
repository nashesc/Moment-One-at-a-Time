'use client'
import { useState } from 'react'

export default function Toggle({ defaultOn = true, onChange }: { defaultOn?: boolean; onChange?: (v: boolean) => void }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => { setOn(v => { onChange?.(!v); return !v }) }}
      className="relative shrink-0 rounded-full border-none cursor-pointer transition-colors duration-200"
      style={{
        width: 42, height: 24,
        background: on ? 'var(--gs)' : '#D1D1D1',
      }}
    >
      <span
        className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: on ? 'calc(100% - 21px)' : '3px' }}
      />
    </button>
  )
}