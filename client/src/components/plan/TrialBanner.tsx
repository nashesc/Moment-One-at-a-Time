'use client'

// client/src/components/plan/TrialBanner.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Sparkles } from 'lucide-react'
import { usePlan } from '@/context/PlanContext'
import { useAuth } from '@/context/AuthContext'

export default function TrialBanner() {
  const { isTrialActive, trialDaysLeft, isPro } = usePlan()
  const { profile } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  const storageKey = profile?.id ? `moment_trial_banner_${profile.id}` : null

  useEffect(() => {
    setMounted(true)
    if (!storageKey) return
    const wasDismissed = localStorage.getItem(storageKey)
    if (wasDismissed) setDismissed(true)
  }, [storageKey])

  function dismiss() {
    setDismissed(true)
    if (storageKey) localStorage.setItem(storageKey, '1')
  }

  // Don't render on server — avoids hydration mismatch
  if (!mounted) return null

  // Don't show if: already Pro, trial not active, or dismissed (unless urgent)
  const isUrgent = trialDaysLeft <= 3
  if (!isTrialActive || isPro) return null
  if (dismissed && !isUrgent) return null

  const bg      = isUrgent ? '#FAEEDA' : '#EAF3DE'
  const border  = isUrgent ? '#EDD59A' : '#C0DD97'
  const color   = isUrgent ? '#854F0B' : '#3B6D11'

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2.5"
      style={{ background: bg, borderBottom: `1px solid ${border}` }}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1" style={{ color }}>
        <Sparkles size={13} className="shrink-0" />
        <p className="text-[12px] truncate">
          {isUrgent
            ? `Trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} —`
            : `${trialDaysLeft} days left in your free trial —`
          }
          {' '}
          <Link
            href="/upgrade"
            className="font-semibold underline underline-offset-2"
            style={{ color }}
          >
            Upgrade to Pro
          </Link>
        </p>
      </div>

      {/* Only show dismiss when not urgent — urgent ones stay visible */}
      {!isUrgent && (
        <button
          onClick={dismiss}
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer' }}
          aria-label="Dismiss trial banner"
        >
          <X size={11} color={color} />
        </button>
      )}
    </div>
  )
}