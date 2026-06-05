'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { OPENING_QUOTES } from '@/assets/data/quotes'

export default function SplashPage() {
  // Start with null — renders nothing on server, picks quote on client only
  const [quote, setQuote] = useState<{ text: string; author: string | null } | null>(null)
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Safe to use Math.random() here — only runs on client, no SSR mismatch
    const picked = OPENING_QUOTES[Math.floor(Math.random() * OPENING_QUOTES.length)]
    setQuote(picked)
    // Slight delay so the fade-in feels intentional
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handleContinue = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div
      onClick={handleContinue}
      className="fixed inset-0 flex flex-col items-center justify-center cursor-pointer select-none"
      style={{
        background: 'linear-gradient(160deg, #1e3d18 0%, #2D5A27 45%, #3D7A35 100%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}
    >
      <div className="px-8 max-w-sm text-center">
        <div
          className="text-6xl mb-8"
          style={{ animation: 'leafFloat 3s ease-in-out infinite' }}
        >
          🌿
        </div>

        {/* Only render quote after client hydration — no mismatch */}
        {quote && (
          <>
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
              <p
                className="text-[12px] mb-10 uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                — {quote.author}
              </p>
            )}
            {!quote.author && <div className="mb-10" />}
          </>
        )}

        <p
          className="text-[13px] tracking-wide"
          style={{
            color: 'rgba(255,255,255,0.35)',
            animation: 'pulse 2.5s ease-in-out infinite',
          }}
        >
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