'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Lock } from 'lucide-react'
import { TRACKS, getTracksByCategory, type Track, type TrackCategory } from '@/data/tracks'
import { useMusic } from '@/context/MusicContext'

const CATEGORY_LABELS: Record<TrackCategory, string> = {
  ambient: 'Ambient',
  focus:   'Focus',
  nature:  'Nature',
}

// Alphabetical — Ambient, Focus, Nature. tracks.ts declares Focus/Nature/Ambient; Pro tier needs A→Z.
const CATEGORIES_ALPHA: TrackCategory[] = ['ambient', 'focus', 'nature']

interface MusicLibraryRailProps {
  isPro: boolean
  variant?: 'desktop' | 'overlay'
  onLockedTrack?: (track: Track) => void
}

// Windowed render — mounts pageSize rows, grows via IntersectionObserver.
// resetKey (not the tracks array) drives the reset effect, since `tracks`
// is a freshly-sorted array on every parent render and using it directly
// as a dep would re-trigger the reset on every unrelated re-render.
function PaginatedRows({
  tracks, pageSize, resetKey, renderRow,
}: {
  tracks: Track[]; pageSize: number; resetKey: string
  renderRow: (t: Track) => React.ReactNode
}) {
  const [count, setCount] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setCount(pageSize) }, [resetKey, pageSize])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCount(c => Math.min(c + pageSize, tracks.length))
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [tracks.length, pageSize])

  return (
    <>
      {tracks.slice(0, count).map(renderRow)}
      {count < tracks.length && <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />}
    </>
  )
}

export default function MusicLibraryRail({ isPro, variant = 'desktop', onLockedTrack }: MusicLibraryRailProps) {
  const { currentTrack, isPlaying, play } = useMusic()

  function Row({ track, showCategory }: { track: Track; showCategory: boolean }) {
    const locked = track.isPro && !isPro
    const active = !locked && currentTrack?.id === track.id
    return (
      <button
        onClick={() => locked ? onLockedTrack?.(track) : play(track)}
        className="w-full flex items-center gap-2.5 mx-2 rounded-xl px-2.5 py-2 text-left transition-colors"
        style={{
          background: active ? 'var(--gpa)' : 'transparent',
          border: 'none', cursor: 'pointer', width: 'calc(100% - 16px)',
        }}
      >
        <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ background: active ? 'var(--gp)' : 'var(--pale-green)' }}>
          {locked
            ? <Lock size={11} color="var(--tg)" />
            : active && isPlaying ? <Pause size={11} fill="white" color="white" />
            : <Play size={11} fill={active ? 'white' : 'var(--gp)'} color={active ? 'white' : 'var(--gp)'} />}
        </span>
        <span className="text-[13px] truncate flex-1"
          style={{ color: active ? 'var(--gp)' : locked ? 'var(--tg)' : 'var(--td)', fontWeight: active ? 500 : 400 }}>
          {track.title}
        </span>
        {showCategory && !locked && (
          <span className="text-[10px] capitalize shrink-0" style={{ color: 'var(--tgl)' }}>{track.category}</span>
        )}
        {locked && <span className="text-[10px] shrink-0" style={{ color: 'var(--tgl)' }}>Pro</span>}
      </button>
    )
  }

  const wrapperClass = variant === 'desktop' ? 'px-6 flex flex-col gap-4' : 'px-4 flex flex-col gap-4'

  // PRO: per-category cards, alphabetical category order, no segregation needed.
  if (isPro) {
    return (
      <div className={wrapperClass}>
        {CATEGORIES_ALPHA.map(cat => {
          const tracks = [...getTracksByCategory(cat)].sort((a, b) => a.title.localeCompare(b.title))
          return (
            <div key={cat} className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between px-4 pt-4 pb-2.5">
                <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--moss)' }}>
                  {CATEGORY_LABELS[cat]}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--tgl)' }}>{tracks.length}</span>
              </div>
              <div className="flex flex-col gap-0.5 pb-2">
                <PaginatedRows
                  tracks={tracks}
                  pageSize={15}
                  resetKey={cat}
                  renderRow={t => <Row key={t.id} track={t} showCategory={false} />}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // FREE: flat two-block layout — available tracks up top, locked tracks below,
  // each tagged by category since there's no per-category card to imply it anymore.
  // Locked rows stay tappable — they open the upgrade gate, they don't go inert.
  const freeTracks = TRACKS.filter(t => !t.isPro).sort((a, b) => a.title.localeCompare(b.title))
  const proTracks  = TRACKS.filter(t => t.isPro)
    .sort((a, b) => a.category === b.category ? a.title.localeCompare(b.title) : a.category.localeCompare(b.category))

  return (
    <div className={wrapperClass}>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2.5">
          <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--moss)' }}>
            Available now
          </span>
          <span className="text-[11px]" style={{ color: 'var(--tgl)' }}>{freeTracks.length}</span>
        </div>
        <div className="flex flex-col gap-0.5 pb-2">
          <PaginatedRows
            tracks={freeTracks}
            pageSize={15}
            resetKey="free"
            renderRow={t => <Row key={t.id} track={t} showCategory />}
          />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tgl)' }}>
            Pro library
          </span>
          <span className="text-[11px]" style={{ color: 'var(--tgl)' }}>{proTracks.length}</span>
        </div>
        <p className="text-[11px] px-4 pb-2" style={{ color: 'var(--tgl)' }}>
          Tap any track to unlock the full library.
        </p>
        <div className="flex flex-col gap-0.5 pb-2">
          <PaginatedRows
            tracks={proTracks}
            pageSize={15}
            resetKey="pro"
            renderRow={t => <Row key={t.id} track={t} showCategory />}
          />
        </div>
      </div>
    </div>
  )
}