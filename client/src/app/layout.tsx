import type { Metadata, Viewport } from 'next'
import './globals.css' // adjust if your globals.css is in styles/

export const metadata: Metadata = {
  title: 'Moment — One at a Time',
  description: 'A calm, focused task app.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2D5A27',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--off-white)]">
        {children}
      </body>
    </html>
  )
}