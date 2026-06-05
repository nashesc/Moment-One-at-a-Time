'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'


const QUOTES = [
  "That's one less thing between you and the rest of your day.",
  "Progress is still progress. Even the small ones.",
  "You showed up. That's everything.",
  "One moment at a time — and you just finished one.",
]

const DURATION = 7 // seconds

interface DonePanelProps {
  taskTitle: string
  onNext: () => void
}

export default function DonePanel({ taskTitle, onNext }: DonePanelProps) {
  const [elapsed, setElapsed] = useState(0)
  // Pick quote once on mount — useRef prevents re-pick on re-render
  const quote = useRef(QUOTES[Math.floor(Math.random() * QUOTES.length)]).current

  const onNextRef = useRef(onNext)
  useEffect(() => { onNextRef.current = onNext }, [onNext])

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(e => {
        const next = e + 1
        if (next >= DURATION) {
          clearInterval(t)
          setTimeout(() => onNextRef.current(), 0)
        }
        return next
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const remaining = DURATION - elapsed
  const progress = (elapsed / DURATION) * 100

  return (
    <motion.div
      onClick={onNext}
      className="rounded-2xl p-6 text-center cursor-pointer select-none"
      style={{ background: '#EAF3DE', border: '1px solid #C0DD97' }}
      title="Tap to continue"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex justify-center mb-3">
        <CheckCircle2 size={40} strokeWidth={1.5} color="var(--gp)" />
      </div>

      <p
        className="text-[16px] leading-relaxed mb-2"
        style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#27500A' }}
      >
        &ldquo;{quote}&rdquo;
      </p>

      <p className="text-[13px] mb-5" style={{ color: 'var(--tg)', textDecoration: 'line-through', opacity: 0.5 }}>
        {taskTitle}
      </p>

      <div className="text-[12px] mb-2" style={{ color: '#3B6D11' }}>
        Next moment in {remaining}s — or tap to continue
      </div>

      <div className="h-1 rounded-full overflow-hidden" style={{ background: '#C0DD97' }}>
        <div
          className="h-full rounded-full"
          style={{
            background: 'var(--gp)',
            width: `${progress}%`,
            transition: 'width 1s linear',
          }}
        />
      </div>
    </motion.div>
  )
}