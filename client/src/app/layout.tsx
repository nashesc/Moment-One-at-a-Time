import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { TaskProvider } from '@/context/TaskContext'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { Providers } from '@/lib/providers'
import RippleProvider from '@/components/ui/RippleProvider'
import '@/app/globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

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
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
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