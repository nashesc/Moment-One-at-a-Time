'use client'

// client/src/components/plan/TrialExpiryModal.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePlan } from '@/context/PlanContext'
import { useAuth } from '@/context/AuthContext'
import { Leaf } from 'lucide-react'

export default function TrialExpiryModal() {
  const { isPro, isTrialActive, loading } = usePlan()
  const { profile } = useAuth()
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)

  const storageKey = profile?.id ? `moment_trial_expired_shown_${profile.id}` : null

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || loading || !storageKey) return

    // Show when: not Pro, trial not active, and haven't shown this modal yet
    const alreadyShown = localStorage.getItem(storageKey)
    if (!isPro && !isTrialActive && !alreadyShown) {
      setShow(true)
      localStorage.setItem(storageKey, '1')
    }
  }, [mounted, loading, isPro, isTrialActive, storageKey])

  function handleUpgrade() {
    setShow(false)
    router.push('/upgrade')
  }

  function handleDismiss() {
    setShow(false)
  }

  if (!mounted) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 transition-opacity duration-200"
        style={{
          background: 'rgba(26,26,26,0.55)',
          opacity: show ? 1 : 0,
          pointerEvents: show ? 'auto' : 'none',
        }}
      />
      <div
        className="fixed inset-x-5 z-50 rounded-3xl p-7 max-w-sm mx-auto transition-[opacity,transform] duration-300"
        style={{
          background: 'var(--ow)',
          boxShadow: 'var(--shadow-modal)',
          top: '50%',
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(-50%) scale(1)' : 'translateY(-45%) scale(0.92)',
          transitionTimingFunction: 'var(--ease-spring)',
          pointerEvents: show ? 'auto' : 'none',
        }}
      >
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Leaf size={52} color="var(--gp)" strokeWidth={1.5} />
          </div>
          <h2 className="text-[22px] font-bold mb-2" 
            style={{ 
              fontFamily: 'var(--font-display)', 
              color: 'var(--td)' 
            }}
          >
            Your free trial has ended
          </h2>
          <p className="text-[14px] leading-relaxed mb-6" 
            style={{ color: 'var(--tg)' }}
          >
            Keep your momentum going. Subscribe to Pro and unlock everything — your data and progress are safe.
          </p>
          <button onClick={handleUpgrade}
            className="w-full rounded-full py-4 text-[15px] font-semibold text-white mb-3"
              style={{ 
                background: 'var(--gp)', 
                boxShadow: 'var(--shadow-btn)', 
                border: 'none', 
                cursor: 'pointer', 
                fontFamily: 'var(--font-body)' 
              }}
            >
            Upgrade to Pro
          </button>
          <button onClick={handleDismiss}
            className="w-full rounded-full py-3 text-[14px]"
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                color: 'var(--tg)', 
                fontFamily: 'var(--font-body)' 
              }}
            >
            Maybe later
          </button>
        </div>
      </div>
    </>
  )
}