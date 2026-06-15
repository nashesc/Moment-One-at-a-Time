'use client'

import { useEffect, useState } from 'react'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, Repeat, Shuffle, List,
  Heart, Lock, Timer, LayoutGrid, 
  Zap, Leaf, Wind,
  type LucideIcon
} from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import ProGateModal from '@/components/ui/ProGateModal'
import { useMusic, type PlayMode } from '@/context/MusicContext'
import { usePlan } from '@/context/PlanContext'
import { TRACKS, getTracksByCategory, type TrackCategory } from '@/assets/data/tracks'
import { motion } from 'motion/react'
import { useSearchParams } from 'next/navigation'

type Tab = TrackCategory | 'favorites' | 'all'

const TABS: {
  id: Tab
  label: string
  Icon: LucideIcon
  proOnly?: boolean
}[] = [
  { id: 'all',       label: 'All',       Icon: LayoutGrid,  proOnly: true },
  { id: 'focus',     label: 'Focus',     Icon: Zap  },
  { id: 'nature',    label: 'Nature',    Icon: Leaf  },
  { id: 'ambient',   label: 'Ambient',   Icon: Wind  },
  { id: 'favorites', label: 'Favorites', Icon: Heart,  proOnly: true },
]


const TIMER_OPTIONS: { label: string; seconds: number | null }[] = [
  { label: '∞',    seconds: null },
  { label: '30m',  seconds: 30 * 60 },
  { label: '1h',   seconds: 60 * 60 },
  { label: '2h',   seconds: 120 * 60 },
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

// Pro gate context — feature name + description per trigger
const PRO_GATES: Record<string, { name: string; description: string }> = {
  favorites: {
    name: 'Favorites',
    description: 'Save tracks you love and access them in one place — available with Pro.',
  },
  library: {
    name: 'Full Music Library',
    description: 'Unlock 100+ tracks across Focus, Nature, and Ambient. Pro gets you everything.',
  },
}

export default function MusicPage() {
  const {
    currentTrack, isPlaying, volume, playMode, timer,
    favorites, isLoading, currentTime, duration,
    play, pause, resume, next, prev,
    setVolume, setPlayMode, setTimer, toggleFavorite, seek, setActivePool,
  } = useMusic()

  const { isPro } = usePlan()

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (currentTrack?.category) return currentTrack.category
    return 'focus'
  })

  const [showTimer, setShowTimer] = useState(false)
  const [showVolume, setShowVolume] = useState(false)

  // Pro gate modal state
  const [gateOpen, setGateOpen] = useState(false)
  const [gateKey, setGateKey] = useState<keyof typeof PRO_GATES>('library')

  function openGate(key: keyof typeof PRO_GATES) {
    setGateKey(key)
    setGateOpen(true)
  }

  const tabTracks = (() => {
    if (activeTab === 'favorites') {
      return [...TRACKS.filter(t => favorites.includes(t.id))].sort((a, b) => a.title.localeCompare(b.title))
    }
    const pool = activeTab === 'all'
      ? [...TRACKS]
      : [...getTracksByCategory(activeTab as TrackCategory)]

    if (isPro) {
      return pool.sort((a, b) => a.title.localeCompare(b.title))
    }

    const free   = pool.filter(t => !t.isPro).sort((a, b) => a.title.localeCompare(b.title))
    const locked = pool.filter(t => t.isPro).sort((a, b) => a.title.localeCompare(b.title))
    return [...free, ...locked]
  })()

  useEffect(() => {
    if (activeTab === 'all') {
      const pool = isPro ? [...TRACKS] : TRACKS.filter(t => !t.isPro)
      setActivePool(pool.sort((a, b) => a.title.localeCompare(b.title)))
    } else if (activeTab === 'favorites') {
      setActivePool(TRACKS.filter(t => favorites.includes(t.id)))
    } else {
      const pool = isPro
        ? getTracksByCategory(activeTab as TrackCategory)
        : getTracksByCategory(activeTab as TrackCategory).filter(t => !t.isPro)
      setActivePool([...pool].sort((a, b) => a.title.localeCompare(b.title)))
    }
  }, [activeTab, isPro, favorites])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const PLAY_MODE_ICONS: Record<PlayMode, React.ReactNode> = {
    all:     <List size={15} />,
    repeat:  <Repeat size={15} />,
    shuffle: <Shuffle size={15} />,
  }

  const cyclePlayMode = () => {
    const modes: PlayMode[] = ['all', 'repeat', 'shuffle']
    const next = modes[(modes.indexOf(playMode) + 1) % modes.length]
    setPlayMode(next)
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />

      <div className="flex flex-col flex-1 min-w-0 pb-40 md:pb-8">

        {/* Header */}
        <div className="px-5 md:px-8 pt-6 pb-2">
          <h1
            className="text-[26px] font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}
          >
            Music
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--tg)' }}>
            Focus sounds for every mood.
          </p>
        </div>

        {/* Now playing card */}
        {currentTrack && (
          <motion.div
            className="mx-5 md:mx-8 mt-4 rounded-2xl p-5"
            style={{ background: 'var(--deep-pine)', boxShadow: 'var(--shadow-card)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Track info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-widest mb-1"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Now Playing
                </p>
                <p
                  className="text-[18px] font-bold truncate"
                  style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.93)' }}
                >
                  {currentTrack.title}
                </p>
                <p className="text-[12px] capitalize mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {currentTrack.category}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3 shrink-0">
                <button
                  onClick={() => {
                    if (!isPro) { openGate('favorites'); return }
                    toggleFavorite(currentTrack.id)
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}
                  aria-label="Toggle favorite"
                >
                  <Heart
                    size={16}
                    color={favorites.includes(currentTrack.id) ? '#D9C17A' : 'rgba(255,255,255,0.5)'}
                    fill={favorites.includes(currentTrack.id) ? '#D9C17A' : 'none'}
                  />
                </button>
                <button
                  onClick={() => setShowVolume(v => !v)}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    color: showVolume ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                  }}
                  aria-label="Toggle volume"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="h-1 rounded-full mb-1 overflow-hidden cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const pct  = (e.clientX - rect.left) / rect.width
                seek(pct * duration)
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'var(--gold)',
                  transition: 'width 0.5s linear',
                }}
              />
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {formatTime(currentTime)}
              </span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {duration > 0 ? formatTime(duration) : '--:--'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              {/* Play mode */}
              <button
                onClick={cyclePlayMode}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  color: playMode !== 'all' ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
                }}
                aria-label="Play mode"
              >
                {PLAY_MODE_ICONS[playMode]}
              </button>

              {/* Prev */}
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}
                aria-label="Previous"
              >
                <SkipBack size={18} color="rgba(255,255,255,0.8)" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={isPlaying ? pause : resume}
                disabled={isLoading}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--gold)',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  boxShadow: '0 4px 16px rgba(217,193,122,0.4)',
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--deep-pine)', borderTopColor: 'transparent' }} />
                ) : isPlaying ? (
                  <Pause size={22} fill="var(--deep-pine)" color="var(--deep-pine)" />
                ) : (
                  <Play size={22} fill="var(--deep-pine)" color="var(--deep-pine)" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={next}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}
                aria-label="Next"
              >
                <SkipForward size={18} color="rgba(255,255,255,0.8)" />
              </button>

              {/* Timer */}
              <button
                onClick={() => setShowTimer(v => !v)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  color: timer !== null ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
                }}
                aria-label="Timer"
              >
                <Timer size={15} />
              </button>
            </div>

            {/* Timer display */}
            {timer !== null && (
               <p className="text-center text-[12px] mt-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Stops in {formatTimer(timer)}
              </p>
            )}

            {/* Timer picker */}
            {showTimer && (
              <div className="flex gap-2 mt-4 justify-center">
                {TIMER_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => { setTimer(opt.seconds); setShowTimer(false) }}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium"
                    style={{
                      background: timer === opt.seconds ? 'var(--gold)' : 'rgba(255,255,255,0.12)',
                      color:      timer === opt.seconds ? 'var(--deep-pine)' : 'rgba(255,255,255,0.7)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Volume */}
            {showVolume && (
              <div className="flex items-center gap-3 mt-4">
                <Volume2 size={14} color="rgba(255,255,255,0.4)" />
                <div className="relative flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${volume * 100}%`, background: 'var(--gold)' }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    style={{ height: '100%' }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 px-5 md:px-8 mt-5 mb-3 overflow-x-auto">
          {TABS.map(tab => {
            const isDisabled = tab.id === 'favorites' && !isPro
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isDisabled) { openGate('favorites'); return }
                  setActiveTab(tab.id)
                }}
                className="whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium flex items-center gap-1.5 transition-all duration-150"
                style={{
                  background: activeTab === tab.id ? 'var(--gp)' : 'white',
                  color:      activeTab === tab.id ? 'white' : isDisabled ? 'var(--tgl)' : 'var(--tg)',
                  border:     activeTab === tab.id ? 'none' : '1px solid var(--border)',
                  boxShadow:  activeTab === tab.id ? 'var(--shadow-btn)' : 'var(--shadow-card)',
                  cursor:     'pointer',
                  fontFamily: 'var(--font-body)',
                  opacity:    isDisabled ? 0.6 : 1,
                }}
              >
                <span><tab.Icon size={14} /></span>
                {tab.label}
                {isDisabled && <Lock size={11} />}
              </button>
            )
          })}
        </div>

        {/* Track list */}
        <div className="flex flex-col gap-2 px-5 md:px-8">
          {tabTracks.length === 0 && activeTab === 'favorites' && (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">♥</p>
              <p className="text-[15px] font-medium" style={{ color: 'var(--td)' }}>No favorites yet</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>
                Tap the heart on any track while playing to save it.
              </p>
            </div>
          )}

          {tabTracks.map((track, i) => {
            const isLocked   = track.isPro && !isPro
            const isActive   = currentTrack?.id === track.id
            const isFav      = favorites.includes(track.id)

            return (
              <motion.button
                key={track.id}
                onClick={() => {
                  if (isLocked) { openGate('library'); return }
                  play(track)
                }}
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
                style={{
                  background: isActive ? 'var(--gpa)' : 'white',
                  border:     isActive ? '1.5px solid var(--gs)' : '1px solid var(--border)',
                  boxShadow:  'var(--shadow-card)',
                  cursor:     'pointer',
                  opacity:    isLocked ? 0.6 : 1,
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: isLocked ? 0.6 : 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(i * 0.02, 0.2) }}
                whileTap={isLocked ? undefined : { scale: 0.98 }}
              >
                {/* Play indicator or number */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: isActive ? 'var(--gp)' : 'var(--gpa)' }}>
                  {isLocked ? (
                    <Lock size={13} color="var(--tg)" />
                  ) : isActive && isPlaying ? (
                    <Pause size={13} fill="white" color="white" />
                  ) : isActive ? (
                    <Play size={13} fill="white" color="white" />
                  ) : (
                    <span className="text-[11px] font-medium" style={{ color: 'var(--tg)' }}>
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[14px] font-medium truncate"
                    style={{ color: isActive ? 'var(--gp)' : 'var(--td)' }}
                  >
                    {track.title}
                  </p>
                  {isLocked && (
                    <p className="text-[11px]" style={{ color: 'var(--tgl)' }}>Pro</p>
                  )}
                </div>

                {/* Favorite */}
                {isPro && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id) }}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                    aria-label="Toggle favorite"
                  >
                    <Heart
                      size={14}
                      color={isFav ? '#D9C17A' : 'var(--tgl)'}
                      fill={isFav ? '#D9C17A' : 'none'}
                    />
                  </button>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Pro gate modal */}
      <ProGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        featureName={PRO_GATES[gateKey].name}
        description={PRO_GATES[gateKey].description}
      />

      <BottomNav />
    </div>
  )
}