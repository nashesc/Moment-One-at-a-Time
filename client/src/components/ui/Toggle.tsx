'use client'

import { useState } from 'react'

interface ToggleProps {
  defaultOn?: boolean
  onChange?: (val: boolean) => void
}

export default function Toggle({ defaultOn = true, onChange }: ToggleProps) {
  const [on, setOn] = useState(defaultOn)

  const handle = () => {
    setOn(v => {
      onChange?.(!v)
      return !v
    })
  }

  return (
    <button
      onClick={handle}
      aria-checked={on}
      role="switch"
      className={`relative h-[21px] w-[38px] rounded-full border-none transition-colors duration-200 cursor-pointer shrink-0 ${
        on ? 'bg-[(--green-sage)]' : 'bg-[#ddd]'
      }`}
    >
      <span
        className={`absolute top-[3px] h-[15px] w-[15px] rounded-full bg-white transition-all duration-200 ${
          on ? 'left-[3px]' : 'left-[20px]'
        }`}
      />
    </button>
  )
}