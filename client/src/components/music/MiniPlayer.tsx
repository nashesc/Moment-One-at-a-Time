'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Pause, SkipForward, X, Zap, Wind, TreePine, type LucideIcon } from 'lucide-react'
import { useMusic } from '@/context/MusicContext'

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

const CATEGORY_ICON: Record<string, LucideIcon> = {
  focus:   Zap,
  nature:  TreePine,
  ambient: Wind,
}

export default function MiniPlayer() {
  const router = useRouter()
  const { currentTrack, isPlaying, timer, isLoading, pause, resume, next, stop } = useMusic()

  const [displayTrack, setDisplayTrack] = useState(currentTrack)
  const [visible, setVisible] = useState(false)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (currentTrack) {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      setDisplayTrack(currentTrack)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      hideTimeoutRef.current = setTimeout(() => setDisplayTrack(null), 300)
    }
    return () => { if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current) }
  }, [currentTrack])

  if (!displayTrack) return null

  const CategoryIcon = CATEGORY_ICON[displayTrack.category]

  return (
    <div
      className="fixed inset-x-0 z-40 md:left-60 md:right-0 xl:right-80 moment-miniplayer flex justify-center px-3 transition-[transform,opacity] duration-300"
      style={{ 
        transform: visible ? 'translateY(0)' : 'translateY(80px)', 
        opacity: visible ? 0.96 : 0, 
        transitionTimingFunction: 'var(--ease-spring)' 
      }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl flex items-center gap-3 px-4 py-3"
        style={{
          background: 'rgba(23, 58, 45, 0.96)',
          boxShadow: '0 -2px 20px rgba(0,0,0,0.25), 0 4px 24px rgba(0,0,0,0.15)',
        }}
      >
        <span className="text-xl shrink-0">
          {CategoryIcon ? (
            <CategoryIcon size={20} style={{ color: 'var(--gpa)' }} />
          ) : (
            '🎵'
          )}
        </span>

        <button
          onClick={() => router.push('/music')}
          className="flex-1 min-w-0 text-left"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <p className="text-[13px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.93)' }}>
            {displayTrack.title}
          </p>
          {timer !== null ? (
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {formatTimer(timer)} remaining
            </p>
          ) : (
            <p className="text-[11px] capitalize" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {displayTrack.category}
            </p>
          )}
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={isPlaying ? pause : resume}
            disabled={isLoading}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity"
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', opacity: isLoading ? 0.5 : 1 }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.6)', borderTopColor: 'transparent' }} />
            ) : isPlaying ? (
              <Pause size={15} fill="white" color="white" />
            ) : (
              <Play size={15} fill="white" color="white" />
            )}
          </button>

          <button onClick={next}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.10)', border: 'none', cursor: 'pointer' }}
            aria-label="Next track">
            <SkipForward size={15} color="rgba(255,255,255,0.8)" />
          </button>

          <button onClick={stop}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.10)', border: 'none', cursor: 'pointer' }}
            aria-label="Stop">
            <X size={15} color="rgba(255,255,255,0.8)" />
          </button>
        </div>
      </div>
    </div>
  )
}