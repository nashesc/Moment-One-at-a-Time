'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutList, BarChart2, Music, Settings } from 'lucide-react'

const NAV = [
  { href: '/dashboard',   label: 'Today',    Icon: Home       },
  { href: '/moments',     label: 'Moments',  Icon: LayoutList },
  { href: '/recap',       label: 'Recap',    Icon: BarChart2  },
  { href: '/music',       label: 'Music',    Icon: Music      },
  { href: '/settings',    label: 'Settings', Icon: Settings   },
]

export default function BottomNav() {
  const path = usePathname()

  // Mark Recap as active when on /reflections too
  const isActive = (href: string) => {
    if (href === '/recap') return path === '/recap' || path === '/reflections'
    return path === href
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex bg-white/90 backdrop-blur-md border-t"
      style={{ borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      {NAV.map(({ href, label, Icon }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 pt-2 pb-1 select-none"
            style={{ textDecoration: 'none' }}
          >
            <span
              className="flex h-8 w-10 items-center justify-center rounded-xl transition-colors duration-150"
              style={{ background: active ? 'var(--gpa)' : 'transparent' }}
            >
              <Icon
                size={19}
                strokeWidth={active ? 2 : 1.5}
                color={active ? 'var(--gp)' : 'var(--tg)'}
              />
            </span>
            <span
              className="text-[10px] font-medium tracking-wide"
              style={{ color: active ? 'var(--gp)' : 'var(--tg)' }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}