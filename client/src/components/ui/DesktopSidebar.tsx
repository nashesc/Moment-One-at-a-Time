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
      className="hidden md:flex flex-col w-60 shrink-0 border-r"
      style={{
        background: 'var(--ow)',
        borderColor: 'var(--border)',
        position: 'sticky',
        top: 0,
        height: '100dvh',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 pt-7 pb-7">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--gp)', boxShadow: '0 2px 8px rgba(45,90,39,0.28)' }}
        >
          <Leaf size={15} color="white" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[14px] font-semibold leading-none" style={{ color: 'var(--td)', fontFamily: 'var(--font-display)' }}>
            Moment
          </p>
          <p className="text-[10px] mt-0.5 leading-none" style={{ color: 'var(--tgl)' }}>One at a Time</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 px-3">
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
              style={{
                background: active ? 'rgba(45,90,39,0.09)' : 'transparent',
                color: active ? 'var(--gp)' : 'var(--tg)',
                textDecoration: 'none',
                fontWeight: active ? 600 : 400,
                fontSize: '13px',
              }}
            >
              <Icon size={17} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User at bottom */}
      <div className="mt-auto px-4 pb-6">
        <div className="flex items-center gap-2.5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ background: 'var(--gp)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate leading-tight" style={{ color: 'var(--td)' }}>
              {profile?.full_name ?? '—'}
            </p>
            <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--tgl)' }}>
              {profile?.email ?? ''}
            </p>
          </div>
          <Link href="/settings" style={{ display: 'flex', textDecoration: 'none', flexShrink: 0 }}>
            <Settings size={14} color="var(--tgl)" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </aside>
  )
}