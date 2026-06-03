'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/context/SettingsContext'

const QUOTES = [
  {
    text: "You do not have to carry the whole mountain today. Just take the next step.",
    author: null,
  },
  {
    text: "You don't have to finish everything today. Just this moment.",
    author: "Moment",
  },
  {
    text: "The present moment is the only moment available to us, and it is the door to all moments.",
    author: "Thich Nhất Hạnh",
  },
  {
    text: "Rest is not idleness. It is the work of coming back to yourself.",
    author: null,
  },
  {
    text: "Small steps forward are still steps forward.",
    author: null,
  },
  {
    text: "Progress is still progress. Even the small ones.",
    author: "Moment",
  },
  {
    text: "Wherever you are, be all there.",
    author: "Jim Elliot",
  },
  {
    text: "Almost everything will work again if you unplug it for a few minutes — including you.",
    author: "Anne Lamott",
  },
  {
    text: "You are allowed to be both a masterpiece and a work in progress simultaneously.",
    author: "Sophia Bush",
  },
  {
    text: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
]

function pickQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)]
}

export default function SplashPage() {
  const router = useRouter()
  const { prefs } = useSettings()
  const [quote] = useState(pickQuote)
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // If setting is off, skip immediately
    if (!prefs.showOpeningQuote) {
      router.replace('/dashboard')
      return
    }
    // Fade in
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [prefs.showOpeningQuote, router])

  const handleContinue = useCallback(() => {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => router.replace('/dashboard'), 500)
  }, [leaving, router])

  // Auto-advance after 8 seconds
  useEffect(() => {
    if (!prefs.showOpeningQuote) return
    const t = setTimeout(handleContinue, 8000)
    return () => clearTimeout(t)
  }, [prefs.showOpeningQuote, handleContinue])

  return (
    <div
      onClick={handleContinue}
      className="fixed inset-0 flex flex-col items-center justify-center cursor-pointer select-none"
      style={{
        background: 'linear-gradient(160deg, #1a3a14 0%, #2D5A27 35%, #3d7a35 65%, #5a8f4a 100%)',
        opacity: visible && !leaving ? 1 : 0,
        transition: leaving ? 'opacity 0.5s ease' : 'opacity 0.8s ease',
      }}
    >
      {/* Soft nature texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(90,158,80,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(196,180,154,0.1) 0%, transparent 40%),
            radial-gradient(ellipse at 60% 80%, rgba(45,90,39,0.2) 0%, transparent 50%)
          `,
        }}
      />

      {/* Mountain silhouette at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ opacity: 0.15 }}>
        <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <polygon points="0,120 80,40 160,120" fill="white" />
          <polygon points="100,120 200,20 300,120" fill="white" />
          <polygon points="240,120 320,50 400,120" fill="white" />
          <rect x="0" y="100" width="400" height="20" fill="white" opacity="0.5" />
        </svg>
      </div>

      {/* Logo mark */}
      <div
        className="mb-10 w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
      </div>

      {/* Quote */}
      <div className="px-8 max-w-sm text-center z-10">
        <p
          className="leading-relaxed mb-5"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(20px, 5vw, 26px)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.95)',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            lineHeight: 1.5,
          }}
        >
          &ldquo;{quote.text}&rdquo;
        </p>

        {quote.author && (
          <p
            className="text-[13px] tracking-widest uppercase"
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.12em',
            }}
          >
            — {quote.author}
          </p>
        )}
      </div>

      {/* Tap to continue */}
      <p
        className="absolute bottom-16 text-[12px] tracking-widest"
        style={{
          color: 'rgba(255,255,255,0.4)',
          fontFamily: 'var(--font-body)',
          letterSpacing: '0.1em',
          animation: 'pulse 2.5s ease-in-out infinite',
        }}
      >
        TAP ANYWHERE TO CONTINUE
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}