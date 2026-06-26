'use client'
import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function StuckSheet({
  open, onClose, onSubmit,
}: { open: boolean; onClose: () => void; onSubmit: (reason?: string) => void }) {
  const [reason, setReason] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { if (open) { setReason(''); setTimeout(() => ref.current?.focus()) } }, [open])

  return (
    <>
      <div 
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{ 
          background: 'rgba(26,26,26,0.55)', 
          opacity: open ? 1 : 0, 
          pointerEvents: open ? 'auto' : 'none' 
        }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center pointer-events-none">
        <div
          className="w-full md:w-[480px] md:max-w-[90vw] rounded-t-3xl md:rounded-3xl transition-transform duration-300"
          style={{
            background: 'var(--ow)', boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
            transform: open ? 'translateY(0)' : 'translateY(100%)',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: open ? 'auto' : 'none',
          }}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
              What's blocking you?
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ 
                background: 'var(--gpa)', 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              <X size={16} color="var(--gp)" />
            </button>
          </div>
          <div className="px-6 pb-8 flex flex-col gap-4">
            <textarea ref={ref} value={reason} 
              onChange={e => setReason(e.target.value)}
              placeholder="Optional — what's in the way?" maxLength={200} rows={3}
              className="w-full rounded-2xl px-4 py-3.5 text-[14px] outline-none resize-none"
              style={{ 
                border: '1.5px solid var(--border)', 
                background: 'white', 
                color: 'var(--td)' 
              }} 
            />
            <button onClick={() => onSubmit(reason.trim() || undefined)}
              className="w-full rounded-full py-4 text-[15px] font-semibold text-white"
              style={{ 
                background: 'var(--gp)', 
                boxShadow: 'var(--shadow-btn)', 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              Mark as stuck
            </button>
          </div>
        </div>
      </div>
    </>
  )
}