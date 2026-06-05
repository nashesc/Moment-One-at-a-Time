import type { Metadata, Viewport } from 'next'
import { TaskProvider } from '@/context/TaskContext'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { Providers } from '@/lib/providers'
import RippleProvider from '@/components/ui/RippleProvider'
import '@/app/globals.css'

if (typeof window !== 'undefined' && !window.crypto?.subtle && window.crypto) {
  // Next.js exposes Node's webcrypto — bridge it to window.crypto.subtle
  try {
    const { webcrypto } = require('crypto')
    Object.defineProperty(window.crypto, 'subtle', {
      get: () => webcrypto.subtle,
      configurable: true,
    })
  } catch {}
}

export const metadata: Metadata = {
  title: 'Moment — One at a Time',
  description: 'Focus on one thing. Then the next.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Moment' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F5F2EC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RippleProvider />
        <Providers>
          <SettingsProvider>
            <AuthProvider>
              <TaskProvider>
                {children}
              </TaskProvider>
            </AuthProvider>
          </SettingsProvider>
        </Providers>
      </body>
    </html>
  )
}