'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import {
  TRACKS,
  getTracksByCategory,
  type Track,
  type TrackCategory,
} from '@/data/tracks'
import { apiFetch } from '@/lib/api'
import { usePlan } from '@/context/PlanContext'

export type PlayMode = 'all' | 'repeat' | 'shuffle'

interface TimeState {
  currentTime: number
  duration: number
}

interface MusicContextValue {
  // State
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  playMode: PlayMode
  timer: number | null        // remaining seconds, null = infinite
  favorites: string[]         // track IDs
  isLoading: boolean

  // Actions
  play: (track: Track) => void
  pause: () => void
  resume: () => void
  stop: () => void
  next: () => void
  prev: () => void
  setVolume: (v: number) => void
  setPlayMode: (m: PlayMode) => void
  setTimer: (seconds: number | null) => void
  toggleFavorite: (trackId: string) => void
  seek: (seconds: number) => void
  setActivePool: (tracks: Track[]) => void

  // High-frequency playback position — NOT part of the main context value.
  // Subscribe directly so only the component that needs per-second updates
  // (the Music page progress bar) re-renders; everything else stays still.
  subscribeTime: (cb: (t: TimeState) => void) => () => void
}

const MusicContext = createContext<MusicContextValue | null>(null)

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const { isPro } = usePlan()
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [volume, setVolumeState]        = useState(0.8)
  const [playMode, setPlayMode]         = useState<PlayMode>('repeat')
  const [timer, setTimerState]          = useState<number | null>(null)
  const [favorites, setFavorites]       = useState<string[]>([])
  const [isLoading, setIsLoading]       = useState(false)
  const [activePool, setActivePoolState] = useState<Track[]>([])
  const activePoolRef = useRef<Track[]>([])

  // ─── High-frequency time state — ref + listener set, never triggers
  // a context re-render. timeupdate fires multiple times/sec while playing;
  // putting that in useState here would re-render every consumer of
  // useMusic() app-wide (MiniPlayer is mounted globally) on every tick.
  const timeRef = useRef<TimeState>({ currentTime: 0, duration: 0 })
  const timeListenersRef = useRef<Set<(t: TimeState) => void>>(new Set())

  const notifyTime = useCallback((patch: Partial<TimeState>) => {
    timeRef.current = { ...timeRef.current, ...patch }
    timeListenersRef.current.forEach(cb => cb(timeRef.current))
  }, [])

  const subscribeTime = useCallback((cb: (t: TimeState) => void) => {
    timeListenersRef.current.add(cb)
    cb(timeRef.current) // immediate sync value on subscribe
    return () => { timeListenersRef.current.delete(cb) }
  }, [])

  useEffect(() => { activePoolRef.current = activePool }, [activePool])

  const setActivePool = useCallback((tracks: Track[]) => {
    setActivePoolState(tracks)
  }, [])

  const allowedTracks = useCallback(
    (category?: TrackCategory) => {
      const pool = category ? getTracksByCategory(category) : TRACKS
      return isPro ? pool : pool.filter(t => !t.isPro)
    },
    [isPro]
  )

  const audioRef         = useRef<HTMLAudioElement | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fadeIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerValueRef    = useRef<number | null>(null)

  const handleTrackEndRef = useRef<() => void>(() => {})
  // ─── Init audio element once ───────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.volume = volume

    audio.addEventListener('timeupdate', () => notifyTime({ currentTime: audio.currentTime }))
    audio.addEventListener('durationchange', () => notifyTime({ duration: audio.duration || 0 }))
    audio.addEventListener('loadstart', () => setIsLoading(true))
    audio.addEventListener('canplay', () => setIsLoading(false))
    audio.addEventListener('ended', () => handleTrackEndRef.current())
    audio.addEventListener('error', () => setIsLoading(false))

    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Load favorites on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!isPro) return
    apiFetch<{ track_id: string }[]>('/api/music/favorites')
      .then(data => setFavorites(data.map(f => f.track_id)))
      .catch(() => {})
  }, [isPro])


  // ─── Sync volume to audio element ─────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // ─── Timer countdown ──────────────────────────────────────────────────────
  // Keep ref in sync so the interval always reads the latest value
  // without needing timer as a dependency (which would restart the
  // interval on every tick and break pause/resume).
  useEffect(() => { timerValueRef.current = timer }, [timer])

  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (!isPlaying) return

    timerIntervalRef.current = setInterval(() => {
      if (timerValueRef.current === null) return
      if (timerValueRef.current <= 1) {
        clearInterval(timerIntervalRef.current!)
        timerIntervalRef.current = null
        setTimerState(null)
        fadeOut()
        return
      }
      setTimerState(prev => (prev === null ? null : prev - 1))
    }, 1000)

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [isPlaying])

  // ─── Track end handler (needs access to latest state via ref) ─────────────
  const playModeRef   = useRef(playMode)
  const currentTrackRef = useRef(currentTrack)
  useEffect(() => { playModeRef.current = playMode },     [playMode])
  useEffect(() => { currentTrackRef.current = currentTrack }, [currentTrack])

  // ─── Core playback ────────────────────────────────────────────────────────
  const loadTrack = useCallback(async (track: Track) => {
    const audio = audioRef.current
    if (!audio) return
    setIsLoading(true)
    try {
      const { url } = await apiFetch<{ url: string }>(`/api/music/signed-url?trackId=${track.id}`)
      audio.pause()
      audio.src = url
      audio.currentTime = 0
      notifyTime({ currentTime: 0, duration: 0 })
      setCurrentTrack(track)
      await audio.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
      setIsLoading(false)
    }
  }, [notifyTime])

  const handleTrackEnd = useCallback(() => {
  const mode  = playModeRef.current
  const track = currentTrackRef.current
  if (!track) return

  if (mode === 'repeat') {
    const audio = audioRef.current
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}) }
    return
  }

  const pool = activePoolRef.current.length > 0
    ? activePoolRef.current
    : allowedTracks(track.category)
  const idx = pool.findIndex(t => t.id === track.id)
  const shufflePool = pool.filter(t => t.id !== track.id)
  const nextTrack = mode === 'shuffle'   // ✓ uses mode (from ref), not playMode (from state)
    ? shufflePool.length > 0
      ? shufflePool[Math.floor(Math.random() * shufflePool.length)]
      : pool[0]
    : pool[(idx + 1) % pool.length]
  if (nextTrack) loadTrack(nextTrack)
}, [allowedTracks, loadTrack])  // ✓ honest deps — both are stable useCallbacks

// ✓ Sync effect placed immediately after handleTrackEnd
useEffect(() => { handleTrackEndRef.current = handleTrackEnd }, [handleTrackEnd])

  const play = useCallback((track: Track) => {
    loadTrack(track)
  }, [loadTrack])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
  }, [])

  const resume = useCallback(() => {
    audioRef.current?.play()
      .then(() => setIsPlaying(true))
      .catch(() => {})
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) { audio.pause(); audio.src = ''; audio.currentTime = 0 }
    setIsPlaying(false)
    setCurrentTrack(null)
    notifyTime({ currentTime: 0, duration: 0 })
    setTimerState(null)
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
  }, [notifyTime])

  const next = useCallback(() => {
    const track = currentTrackRef.current
    if (!track) return
    const pool = activePoolRef.current.length > 0 ? activePoolRef.current : allowedTracks(track.category)
    const idx  = pool.findIndex(t => t.id === track.id)
    const shufflePool = pool.filter(t => t.id !== track.id)
    const nextTrack = playMode === 'shuffle'
      ? shufflePool.length > 0
        ? shufflePool[Math.floor(Math.random() * shufflePool.length)]
        : track  // only one track — replay it
      : pool[(idx + 1) % pool.length]
    if (nextTrack) loadTrack(nextTrack)
  }, [playMode, loadTrack, allowedTracks])

  const prev = useCallback(() => {
    const track = currentTrackRef.current
    if (!track) return
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      notifyTime({ currentTime: 0 })
      return
    }
    const pool = activePoolRef.current.length > 0 ? activePoolRef.current : allowedTracks(track.category)
    const idx  = pool.findIndex(t => t.id === track.id)
    const shufflePool = pool.filter(t => t.id !== track.id)
    const prevTrack = playMode === 'shuffle'
      ? shufflePool.length > 0
        ? shufflePool[Math.floor(Math.random() * shufflePool.length)]
        : track
      : pool[(idx - 1 + pool.length) % pool.length]
    if (prevTrack) loadTrack(prevTrack)
  }, [playMode, loadTrack, allowedTracks, notifyTime])

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (audio) { audio.currentTime = seconds }
    notifyTime({ currentTime: seconds })
  }, [notifyTime])

  // ─── Volume ───────────────────────────────────────────────────────────────
  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v))
    setVolumeState(clamped)
  }, [])

  // ─── Timer ────────────────────────────────────────────────────────────────
  const setTimer = useCallback((seconds: number | null) => {
    setTimerState(seconds)
  }, [])

  // ─── Fade out when timer expires ──────────────────────────────────────────
  const fadeOut = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const startVolume = audio.volume
    const step = startVolume / 30 // fade over ~3 seconds

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) return
      const next = Math.max(0, audioRef.current.volume - step)
      audioRef.current.volume = next
      if (next <= 0) {
        clearInterval(fadeIntervalRef.current!)
        audioRef.current.pause()
        audioRef.current.volume = startVolume // restore for next play
        setIsPlaying(false)
      }
    }, 100)
  }, [])

  // ─── Favorites ────────────────────────────────────────────────────────────
  const toggleFavorite = useCallback((trackId: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(trackId)
      if (isFav) {
        apiFetch(`/api/music/favorites/${trackId}`, { method: 'DELETE' }).catch(() => {})
        return prev.filter(id => id !== trackId)
      } else {
        apiFetch('/api/music/favorites', {
          method: 'POST',
          body: JSON.stringify({ track_id: trackId }),
        }).catch(() => {})
        return [...prev, trackId]
      }
    })
  }, [])

  // ─── Memoized provider value ───────────────────────────────────────────────
  // All action functions below are stable useCallbacks (or stable across
  // renders given their deps), so this object only changes identity when
  // currentTrack/isPlaying/volume/playMode/timer/favorites/isLoading change —
  // none of which fire multiple times per second. currentTime/duration are
  // intentionally excluded; consumers get those via subscribeTime instead.
  const value = useMemo<MusicContextValue>(() => ({
    currentTrack, isPlaying, volume, playMode, timer, favorites, isLoading,
    play, pause, resume, stop, next, prev,
    setVolume, setPlayMode, setTimer, toggleFavorite, seek, setActivePool,
    subscribeTime,
  }), [
    currentTrack, isPlaying, volume, playMode, timer, favorites, isLoading,
    play, pause, resume, stop, next, prev,
    setVolume, setPlayMode, setTimer, toggleFavorite, seek, setActivePool,
    subscribeTime,
  ])

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used inside MusicProvider')
  return ctx
}