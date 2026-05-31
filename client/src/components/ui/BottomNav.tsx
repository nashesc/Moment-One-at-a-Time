'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutList, BarChart2, Leaf, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Today', Icon: Home },
  { href: '/moments', label: 'Moments', Icon: LayoutList },
  { href: '/recap', label: 'Recap', Icon: BarChart2 },
  { href: '/reflections', label: 'Reflections', Icon: Leaf },
  { href: '/settings', label: 'Settings', Icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-white border-t border-[#e8e4dc] pb-safe">
      {navItems.map(({ href, label, Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-[3px] py-2 no-underline"
          >
            <span
              className={`flex h-7 w-9 items-center justify-center rounded-lg transition-colors ${
                active ? 'bg-[(--green-pale)]' : ''
              }`}
            >
              <Icon
                size={20}
                className={active ? 'text-[(--green-primary)]' : 'text-[(--text-gray)]'}
                strokeWidth={1.75}
              />
            </span>
            <span
              className={`text-[10px] ${
                active
                  ? 'font-medium text-[(--green-primary)]'
                  : 'text-[(--text-gray)]'
              }`}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}