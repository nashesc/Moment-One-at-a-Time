'use client'

import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import Toggle from '@/components/ui/Toggle'

const SECTIONS = [
  { title: 'Appearance',    rows: [{ label: 'Theme', value: 'Light' }] },
  {
    title: 'Display',
    rows: [
      { label: 'Show opening quote',     toggle: true, defaultOn: true  },
      { label: 'One task at a time',     toggle: true, defaultOn: true  },
    ],
  },
  {
    title: 'Notifications',
    rows: [
      { label: 'Push notifications',     toggle: true, defaultOn: false },
      { label: 'Reminder time',          value: '9:00 AM'               },
    ],
  },
  {
    title: 'Account',
    rows: [
      { label: 'Name',  value: 'Maria Santos'      },
      { label: 'Email', value: 'maria@example.com' },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0 pb-24 md:pb-8 px-5 md:px-8">
        <div className="pt-6 pb-4">
          <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>Settings</h1>
        </div>

        <div className="flex flex-col gap-4">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <p className="text-[11px] uppercase tracking-widest pb-2 pl-1" style={{ color: 'var(--tg)' }}>
                {section.title}
              </p>
              <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                {section.rows.map((row, i) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: i < section.rows.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <span className="text-[14px]" style={{ color: 'var(--td)' }}>{row.label}</span>
                    {row.toggle
                      ? <Toggle defaultOn={row.defaultOn} />
                      : <span className="text-[13px]" style={{ color: 'var(--tg)' }}>{row.value}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            className="w-full rounded-full py-[14px] text-[14px] font-medium transition-opacity hover:opacity-80 mt-2"
            style={{
              background: 'white',
              border: '1.5px solid #FBDCDC',
              color: '#C0392B',
              boxShadow: 'var(--shadow-card)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}