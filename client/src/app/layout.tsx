import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Navigation } from '@/components/layout/Navigation'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Moment: One at a Time',
  description: 'Focus on what truly matters, one moment at a time.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <Navigation />
        <div className="md:pl-64">
          {children}
        </div>
      </body>
    </html>
  )
}