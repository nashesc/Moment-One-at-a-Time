'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, Music, Pause, Play } from 'lucide-react'
import { useFocusSession, type TimerMode } from '@/hooks/useFocusSession'
import { useAuth } from '@/context/AuthContext'
import { usePlan } from '@/context/PlanContext'
import MusicLibraryRail from '@/components/music/MusicLibraryRail'
import StuckSheet from '@/components/dashboard/StuckSheet'
import ProGateModal from '@/components/plan/ProGateModal'

interface FocusOverlayProps {
  task: { id: string; title: string; estimatedMinutes: number }
  onClose: () => void
  onFinish: (durationSeconds: number) => void
  onStuck: (durationSeconds: number, reason?: string) => void
  onSkip: (durationSeconds: number) => void
}

function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function FocusOverlay({ task, onClose, onFinish, onStuck, onSkip }: FocusOverlayProps) {
  const { profile } = useAuth()
  const { isPro } = usePlan()

  const [showTimesUp, setShowTimesUp] = useState(false)
  const {
    mode, setMode, running, elapsed, hasOverrun, targetSeconds,
    start, pause, resume, finalize,
  } = useFocusSession(profile?.id ?? null, task.id, task.estimatedMinutes, () => setShowTimesUp(true))

  const [view, setView] = useState<'timer' | 'browse'>('timer')
  const [stuckOpen, setStuckOpen] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (running || elapsed > 0) setHasStarted(true)
  }, [running, elapsed])

  const handlePlayPause = useCallback(() => {
    if (!hasStarted) { start(); return }
    running ? pause() : resume()
  }, [hasStarted, running, start, pause, resume])

  const handleFinish = useCallback(() => onFinish(finalize()), [finalize, onFinish])
  const handleSkip   = useCallback(() => onSkip(finalize()),   [finalize, onSkip])
  const handleStuckSubmit = useCallback((reason?: string) => {
    setStuckOpen(false)
    onStuck(finalize(), reason)
  }, [finalize, onStuck])

  const overrunSeconds = Math.max(elapsed - targetSeconds, 0)
  const display = mode === 'countdown'
    ? (hasOverrun ? overrunSeconds : Math.max(targetSeconds - elapsed, 0))
    : elapsed

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'linear-gradient(160deg, #1e3d18 0%, #2D5A27 45%, #3D7A35 100%)' }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <AnimatePresence>
        {showTimesUp && (
          <motion.div
            onClick={() => { setShowTimesUp(false); onClose() }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center cursor-pointer select-none"
            style={{ background: 'rgba(23,58,45,0.97)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <p className="text-[12px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Time&apos;s up
            </p>
            <p className="text-[22px] leading-relaxed mb-10" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'rgba(255,255,255,0.93)' }}>
              &ldquo;{task.title}&rdquo; is still open — pick it back up whenever you&apos;re ready.
            </p>
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Tap anywhere to continue</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <button onClick={onClose} aria-label="Back to dashboard"
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={20} color="rgba(255,255,255,0.85)" />
        </button>
        <p className="text-[12px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {view === 'timer' ? 'Focusing' : 'Browse music'}
        </p>
        <button onClick={() => setView(v => v === 'timer' ? 'browse' : 'timer')} aria-label="Toggle music browser"
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: view === 'browse' ? 'var(--gold)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}>
          <Music size={18} color={view === 'browse' ? 'var(--deep-pine)' : 'rgba(255,255,255,0.85)'} />
        </button>
      </div>

      {view === 'timer' ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <p className="text-[13px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Your moment
          </p>
          <h1 className="text-[26px] font-bold text-center mb-10 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.95)' }}>
            {task.title}
          </h1>

          <p className="text-[56px] font-bold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.97)' }}>
            {hasOverrun && mode === 'countdown' && '+'}{formatClock(display)}
          </p>

          {mode === 'countdown' && !hasOverrun && (
            <p className="text-[12px] mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              of {task.estimatedMinutes} min estimated
            </p>
          )}
          {hasOverrun && mode === 'countdown' && (
            <p className="text-[12px] mt-2" style={{ color: 'var(--gold)' }}>past your estimate</p>
          )}

          {!hasStarted && (
            <div className="flex gap-2 mt-8 p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              {(['stopwatch', 'countdown'] as TimerMode[]).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className="px-4 py-1.5 rounded-full text-[12px] font-medium"
                  style={{
                    background: mode === m ? 'rgba(255,255,255,0.18)' : 'transparent',
                    color: mode === m ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                    border: 'none', cursor: 'pointer',
                  }}>
                  {m === 'stopwatch' ? 'Open' : 'Countdown'}
                </button>
              ))}
            </div>
          )}

          <button onClick={handlePlayPause}
            className="w-20 h-20 rounded-full flex items-center justify-center mt-12"
            style={{ background: 'var(--gold)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 24px rgba(217,193,122,0.4)' }}
            aria-label={running ? 'Pause' : hasStarted ? 'Resume' : 'Start'}>
            {running
              ? <Pause size={28} fill="var(--deep-pine)" color="var(--deep-pine)" />
              : <Play size={28} fill="var(--deep-pine)" color="var(--deep-pine)" />}
          </button>
          <p className="text-[12px] mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {running ? 'Pause' : hasStarted ? 'Resume' : 'Begin'}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-4">
          <MusicLibraryRail isPro={isPro} variant="overlay" onLockedTrack={() => setGateOpen(true)} />
        </div>
      )}

      <div className="px-5 pb-8 pt-3 flex gap-2">
        <button onClick={() => setStuckOpen(true)}
          className="flex-1 py-3 rounded-full text-[13px] font-medium"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer' }}>
          I&apos;m Stuck
        </button>
        <button onClick={handleSkip}
          className="flex-1 py-3 rounded-full text-[13px] font-medium"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer' }}>
          Skip for now
        </button>
        <button onClick={handleFinish}
          className="flex-[1.4] py-3 rounded-full text-[13px] font-semibold"
          style={{ background: 'var(--gold)', color: 'var(--deep-pine)', border: 'none', cursor: 'pointer' }}>
          Finish
        </button>
      </div>

      <StuckSheet open={stuckOpen} onClose={() => setStuckOpen(false)} onSubmit={handleStuckSubmit} />
      <ProGateModal open={gateOpen} onClose={() => setGateOpen(false)}
        featureName="Full Music Library"
        description="Unlock 100+ tracks across every category — available with Pro." />
    </motion.div>
  )
}