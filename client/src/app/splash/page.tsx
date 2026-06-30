'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FREE_OPENING_QUOTE_COUNT, OPENING_QUOTES } from '@/data/quotes'
import { usePlan } from '@/context/PlanContext'
import { createClient } from '@/lib/supabase/client'
import { Leaf } from 'lucide-react'

export default function SplashPage() {
  const [quote, setQuote] = useState<{ text: string; author: string | null } | null>(null)
  const [quoteVisible, setQuoteVisible] = useState(false)
  const router = useRouter()
  const { isPro } = usePlan()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      try {
        const stored = localStorage.getItem(`moment_preferences_${session.user.id}`)
        if (stored) {
          const prefs = JSON.parse(stored)
          if (prefs.showOpeningQuote === false) {
            router.replace('/dashboard')
            return
          }
        }
      } catch {}

      const pool = isPro ? OPENING_QUOTES : OPENING_QUOTES.slice(0, FREE_OPENING_QUOTE_COUNT)
      const picked = pool[Math.floor(Math.random() * pool.length)]
      setQuote(picked)
      requestAnimationFrame(() => setQuoteVisible(true))
    }
    init()
  }, [router])

  const handleContinue = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div
      onClick={handleContinue}
      className="fixed inset-0 flex flex-col items-center justify-center cursor-pointer select-none"
      style={{
        background: 'linear-gradient(160deg, #1e3d18 0%, #2D5A27 45%, #3D7A35 100%)',
      }}
    >
      <div className="px-8 max-w-sm text-center">
        <div
          className="mb-6 flex justify-center"
          style={{ animation: 'leafFloat 3s ease-in-out infinite' }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.12)' }}
          >
            <Leaf size={36} color="rgba(255,255,255,0.93)" strokeWidth={1.5} />
          </div>
        </div>

        {quote && (
          <div style={{ opacity: quoteVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            <p
              className="leading-relaxed mb-3"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '22px',
                color: 'rgba(255,255,255,0.93)',
                lineHeight: 1.65,
              }}
            >
              &ldquo;{quote.text}&rdquo;
            </p>
            {quote.author && (
              <p className="text-[12px] mb-10 uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                - {quote.author} -
              </p>
            )}
            {!quote.author && <div className="mb-10" />}
          </div>
        )}

        <p className="text-[13px] tracking-wide"
          style={{ color: 'rgba(255,255,255,0.35)', animation: 'pulse 2.5s ease-in-out infinite' }}>
          Tap anywhere to continue
        </p>
      </div>

      <style>{`
        @keyframes leafFloat {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50%       { transform: translateY(-8px) rotate(4deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.65; }
        }
      `}</style>
    </div>
  )
}