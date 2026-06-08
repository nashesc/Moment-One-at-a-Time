'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import {
  TRACKS,
  getTracksByCategory,
  type Track,
  type TrackCategory,
} from '@/assets/data/tracks'
import { apiFetch } from '@/lib/api'
import { usePlan } from '@/context/PlanContext'

export type PlayMode = 'all' | 'repeat' | 'shuffle'

interface MusicContextValue {
  // State
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  playMode: PlayMode
  timer: number | null        // remaining seconds, null = infinite
  favorites: string[]         // track IDs
  isLoading: boolean
  currentTime: number
  duration: number

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
}

const MusicContext = createContext<MusicContextValue | null>(null)

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const { isPro } = usePlan()
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [volume, setVolumeState]        = useState(0.8)
  const [playMode, setPlayMode]         = useState<PlayMode>('all')
  const [timer, setTimerState]          = useState<number | null>(null)
  const [favorites, setFavorites]       = useState<string[]>([])
  const [isLoading, setIsLoading]       = useState(false)
  const [currentTime, setCurrentTime]   = useState(0)
  const [duration, setDuration]         = useState(0)

  const allowedTracks = useCallback(
    (category?: TrackCategory) => {
      const pool = category ? getTracksByCategory(category) : TRACKS
      return isPro ? pool : pool.filter(t => !t.isPro)
    },
    [isPro]
  )

  const audioRef        = useRef<HTMLAudioElement | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fadeIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  

  // ─── Init audio element once ───────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.volume = volume

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
    audio.addEventListener('durationchange', () => setDuration(audio.duration || 0))
    audio.addEventListener('loadstart', () => setIsLoading(true))
    audio.addEventListener('canplay', () => setIsLoading(false))
    audio.addEventListener('ended', () => handleTrackEnd())
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
    apiFetch<{ track_id: string }[]>('/api/music/favorites')
      .then(data => setFavorites(data.map(f => f.track_id)))
      .catch(() => {}) // silently fail — not critical
  }, [])

  // ─── Sync volume to audio element ─────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // ─── Timer countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (timer === null || !isPlaying) return

    timerIntervalRef.current = setInterval(() => {
      setTimerState(prev => {
        if (prev === null) return null
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!)
          fadeOut()
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, isPlaying])

  // ─── Track end handler (needs access to latest state via ref) ─────────────
  const playModeRef   = useRef(playMode)
  const currentTrackRef = useRef(currentTrack)
  useEffect(() => { playModeRef.current = playMode },     [playMode])
  useEffect(() => { currentTrackRef.current = currentTrack }, [currentTrack])

  const handleTrackEnd = useCallback(() => {
    const mode  = playModeRef.current
    const track = currentTrackRef.current
    if (!track) return

    if (mode === 'repeat') {
      const audio = audioRef.current
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}) }
      return
    }

    const pool    = allowedTracks(track.category)
    const idx     = pool.findIndex(t => t.id === track.id)
    const nextTrk = mode === 'shuffle'
      ? pool.filter(t => t.id !== track.id)[Math.floor(Math.random() * (pool.length - 1))]
      : pool[(idx + 1) % pool.length]
    if (nextTrk) loadTrack(nextTrk)
  }, [])

  // ─── Core playback ────────────────────────────────────────────────────────
  const loadTrack = useCallback((track: Track) => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.src = track.url
    audio.currentTime = 0
    setCurrentTrack(track)
    setCurrentTime(0)
    setDuration(0)
    setIsLoading(true)

    audio.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false))
  }, [])

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
    setCurrentTime(0)
    setDuration(0)
    setTimerState(null)
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
  }, [])

  const next = useCallback(() => {
    const track = currentTrackRef.current
    if (!track) return
    const pool = allowedTracks(track.category)
    const idx  = pool.findIndex(t => t.id === track.id)
    const nextTrack = playMode === 'shuffle'
      ? pool.filter(t => t.id !== track.id)[Math.floor(Math.random() * (pool.length - 1))]
      : pool[(idx + 1) % pool.length]
    if (nextTrack) loadTrack(nextTrack)
  }, [playMode, loadTrack, allowedTracks])

  const prev = useCallback(() => {
    const track = currentTrackRef.current
    if (!track) return
    // If more than 3s in, restart current track instead of going back
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    const pool = allowedTracks(track.category)
    const idx  = pool.findIndex(t => t.id === track.id)
    const prevTrack = pool[(idx - 1 + pool.length) % pool.length]
    if (prevTrack) loadTrack(prevTrack)
  }, [loadTrack])

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (audio) { audio.currentTime = seconds; setCurrentTime(seconds) }
  }, [])

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

  return (
    <MusicContext.Provider value={{
      currentTrack, isPlaying, volume, playMode, timer,
      favorites, isLoading, currentTime, duration,
      play, pause, resume, stop, next, prev,
      setVolume, setPlayMode, setTimer, toggleFavorite, seek,
    }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used inside MusicProvider')
  return ctx
}