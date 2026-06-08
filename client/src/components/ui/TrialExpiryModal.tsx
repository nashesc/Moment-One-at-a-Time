'use client'

// client/src/components/ui/TrialExpiryModal.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { usePlan } from '@/context/PlanContext'
import { useAuth } from '@/context/AuthContext'

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
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-5 z-50 rounded-3xl p-7 max-w-sm mx-auto"
            style={{
              background: 'var(--ow)',
              boxShadow: 'var(--shadow-modal)',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            initial={{ opacity: 0, scale: 0.92, y: '-45%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.92, y: '-45%' }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🌿</div>
              <h2
                className="text-[22px] font-bold mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}
              >
                Your free trial has ended
              </h2>
              <p className="text-[14px] leading-relaxed mb-6" style={{ color: 'var(--tg)' }}>
                Keep your momentum going. Subscribe to Pro and unlock everything — your data and progress are safe.
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
                onClick={handleDismiss}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}