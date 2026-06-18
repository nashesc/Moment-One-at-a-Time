import { useMusic } from '@/context/MusicContext'

export function useFabOffset() {
  const { currentTrack } = useMusic()
  return currentTrack
    ? 'calc(140px + env(safe-area-inset-bottom, 0px))'
    : 'calc(112px + env(safe-area-inset-bottom, 0px))'
}