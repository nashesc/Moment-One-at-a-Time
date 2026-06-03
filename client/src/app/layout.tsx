import type { Metadata, Viewport } from 'next'
import { TaskProvider } from '@/context/TaskContext'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { Providers } from '@/lib/providers'
import '@/app/globals.css'

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