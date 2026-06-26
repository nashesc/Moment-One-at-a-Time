'use client'

import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

interface ProGateModalProps {
  open: boolean
  onClose: () => void
  featureName: string
  description?: string
}

export default function ProGateModal({ open, onClose, featureName, description }: ProGateModalProps) {
  const router = useRouter()

  function handleUpgrade() {
    onClose()
    router.push('/upgrade')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-200"
        style={{ 
          background: 'rgba(26,26,26,0.6)',
          opacity: open ? 1 : 0, 
          pointerEvents: open ? 'auto' : 'none' 
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-x-5 z-50 rounded-3xl p-7 max-w-sm mx-auto transition-[opacity,transform] duration-300"
        style={{
          background: 'var(--ow)', boxShadow: 'var(--shadow-modal)', top: '50%',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(-50%) scale(1)' : 'translateY(-45%) scale(0.92)',
          transitionTimingFunction: 'var(--ease-spring)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--gpa)' }}
          >
            <Lock size={24} color="var(--gp)" strokeWidth={1.75} />
          </div>

          <h2
            className="text-[20px] font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}
          >
            {featureName} is Pro
          </h2>

          <p className="text-[14px] leading-relaxed mb-6" style={{ color: 'var(--tg)' }}>
            {description ??
              `Upgrade to Pro to unlock ${featureName} and the full Moment experience.`}
          </p>

          <button
            onClick={handleUpgrade}
            className="w-full rounded-full py-4 text-[15px] font-semibold text-white mb-3"
            style={{
              background: 'var(--gp)',
              boxShadow: 'var(--shadow-btn)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Upgrade to Pro
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-full py-3 text-[14px]"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--tg)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </>
  )
}