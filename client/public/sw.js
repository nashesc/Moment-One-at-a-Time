const CACHE_NAME = 'moment-v2'

const APP_SHELL = [
  '/dashboard',
  '/moments',
  '/recap',
  '/reflections',
  '/settings',
  '/splash',
  '/manifest.json',
]

async function precache() {
  const cache = await caches.open(CACHE_NAME)
  await Promise.allSettled(APP_SHELL.map(url => cache.add(url)))
}

self.addEventListener('install', event => {
  event.waitUntil(precache())
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Don't intercept external API calls — app handles offline data via IndexedDB
  if (url.host !== self.location.host) return

  // Next.js static chunks are content-hashed — safe to cache forever
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(res => {
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(request, res.clone()))
          return res
        })
      })
    )
    return
  }

  // Navigation requests — network-first, cache as fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(request, res.clone()))
          return res
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || caches.match('/dashboard')
        })
    )
    return
  }

  // Everything else — stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(request)
      const fresh = fetch(request).then(res => {
        if (res.ok) cache.put(request, res.clone())
        return res
      }).catch(() => cached)
      return cached || fresh
    })
  )
})

self.addEventListener('push', event => {
  const data = event.data?.json() ?? {}
  event.waitUntil(self.registration.showNotification(data.title ?? 'Moment', {
    body: data.body ?? 'Time to focus on your next moment.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url ?? '/dashboard' },
  }))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url ?? '/dashboard'))
})