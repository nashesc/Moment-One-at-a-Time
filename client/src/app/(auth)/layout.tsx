'use client'

import { usePathname } from 'next/navigation'
import { Leaf } from 'lucide-react'

const TAGLINE_ROUTES = ['/login', '/register']

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showTagline = TAGLINE_ROUTES.includes(pathname)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--ow)' }}>
      <div className="flex flex-col items-center pt-16 pb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--gp)', boxShadow: 'var(--shadow-btn)' }}
        >
          <Leaf size={26} color="white" strokeWidth={1.75} />
        </div>
        <h1
          className="text-[26px] font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}
        >
          Moment
        </h1>
        {showTagline && (
          <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>One at a time.</p>
        )}
      </div>

      <div className="flex-1 px-6 max-w-sm mx-auto w-full">
        <div className="rounded-3xl p-6" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}