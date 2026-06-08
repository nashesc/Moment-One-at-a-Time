'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutList, BarChart2, Music, Settings, Leaf } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NAV = [
  { href: '/dashboard',   label: 'Today',    Icon: Home       },
  { href: '/moments',     label: 'Moments',  Icon: LayoutList },
  { href: '/recap',       label: 'Recap',    Icon: BarChart2  },
  { href: '/music',       label: 'Music',    Icon: Music      },
  { href: '/settings',    label: 'Settings', Icon: Settings   },
]

export default function DesktopSidebar() {
  const path = usePathname()
  const { profile } = useAuth()

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  // Mark Recap as active when on /reflections too
  const isActive = (href: string) => {
    if (href === '/recap') return path === '/recap' || path === '/reflections'
    return path === href
  }

  return (
    <aside
      className="hidden md:flex flex-col w-56 min-h-screen border-r pt-8 pb-6 px-4 shrink-0"
      style={{ background: 'var(--ow)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--gp)' }}
        >
          <Leaf size={18} color="white" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[14px] font-semibold leading-tight" style={{ color: 'var(--td)', fontFamily: 'var(--font-display)' }}>
            Moment
          </p>
          <p className="text-[10px]" style={{ color: 'var(--tg)' }}>One at a Time</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-[10px] rounded-xl transition-colors duration-150"
              style={{
                background: active ? 'var(--gpa)' : 'transparent',
                color: active ? 'var(--gp)' : 'var(--tg)',
                textDecoration: 'none',
                fontWeight: active ? 500 : 400,
                fontSize: '14px',
              }}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User at bottom */}
      <div className="mt-auto flex items-center gap-3 px-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold shrink-0"
          style={{ background: 'var(--gp)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--td)' }}>
            {profile?.full_name ?? '—'}
          </p>
          <p className="text-[10px] truncate" style={{ color: 'var(--tg)' }}>
            {profile?.email ?? ''}
          </p>
        </div>
        <Link href="/settings" style={{ display: 'flex', textDecoration: 'none' }}>
          <Settings size={15} color="var(--tg)" strokeWidth={1.5} />
        </Link>
      </div>
    </aside>
  )
}