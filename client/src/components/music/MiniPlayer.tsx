'use client'

import { useRouter } from 'next/navigation'
import { Play, Pause, SkipForward, X } from 'lucide-react'
import { useMusic } from '@/context/MusicContext'
import { motion, AnimatePresence } from 'motion/react'

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

const CATEGORY_EMOJI: Record<string, string> = {
  focus:   '🎯',
  nature:  '🌿',
  ambient: '🌌',
}

export default function MiniPlayer() {
  const router = useRouter()
  const { currentTrack, isPlaying, timer, isLoading, pause, resume, next, stop } = useMusic()

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          className="fixed left-0 right-0 z-40 md:left-60 md:right-74 moment-miniplayer"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0,  opacity: .96 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <div
            className="mx-3 rounded-2xl flex items-center gap-3 px-4 py-3"
            style={{
              background: 'rgba(23, 58, 45, 0.96)',
              boxShadow: '0 -2px 20px rgba(0,0,0,0.25), 0 4px 24px rgba(0,0,0,0.15)',
            }}
          >
            {/* Category emoji */}
            <span className="text-xl shrink-0">
              {CATEGORY_EMOJI[currentTrack.category] ?? '🎵'}
            </span>

            {/* Track info — tapping navigates to /music */}
            <button
              onClick={() => router.push('/music')}
              className="flex-1 min-w-0 text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <p
                className="text-[13px] font-medium truncate"
                style={{ color: 'rgba(255,255,255,0.93)' }}
              >
                {currentTrack.title}
              </p>
              {timer !== null ? (
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {formatTimer(timer)} remaining
                </p>
              ) : (
                <p className="text-[11px] capitalize" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {currentTrack.category}
                </p>
              )}
            </button>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Play / Pause */}
              <button
                onClick={isPlaying ? pause : resume}
                disabled={isLoading}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.6)', borderTopColor: 'transparent' }}
                  />
                ) : isPlaying ? (
                  <Pause size={15} fill="white" color="white" />
                ) : (
                  <Play size={15} fill="white" color="white" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={next}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.10)', border: 'none', cursor: 'pointer' }}
                aria-label="Next track"
              >
                <SkipForward size={15} color="rgba(255,255,255,0.8)" />
              </button>

              {/* Stop */}
              <button
                onClick={stop}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.10)', border: 'none', cursor: 'pointer' }}
                aria-label="Stop"
              >
                <X size={15} color="rgba(255,255,255,0.8)" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}