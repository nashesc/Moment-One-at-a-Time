'use client'

import BottomNav from '@/components/ui/BottomNav'
import Toggle from '@/components/ui/Toggle'

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[(--off-white)] pb-20">
      <div className="px-6 pt-5 pb-2">
        <h1 className="text-[24px] text-[(--text-dark)]" style={{ fontFamily: '(--font-display)' }}>Settings</h1>
      </div>

      {[
        {
          title: 'Appearance',
          rows: [{ label: 'Theme', value: 'Light' }],
        },
        {
          title: 'Display',
          rows: [
            { label: 'Show opening quote', toggle: true, defaultOn: true },
            { label: 'One task at a time', toggle: true, defaultOn: true },
          ],
        },
        {
          title: 'Notifications',
          rows: [
            { label: 'Push notifications', toggle: true, defaultOn: false },
            { label: 'Reminder time', value: '9:00 AM' },
          ],
        },
        {
          title: 'Account',
          rows: [
            { label: 'Name', value: 'Maria Santos' },
            { label: 'Email', value: 'maria@example.com' },
          ],
        },
      ].map(section => (
        <div key={section.title}>
          <p className="px-6 pt-4 pb-1 text-[11px] uppercase tracking-widest text-[(--text-gray)]">
            {section.title}
          </p>
          <div className="mx-5 overflow-hidden rounded-[13px] bg-white border border-[#eee]">
            {section.rows.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-4 py-3 ${
                  i < section.rows.length - 1 ? 'border-b border-[#f5f3ef]' : ''
                }`}
              >
                <span className="text-[14px] text-[(--text-dark)]">{row.label}</span>
                {row.toggle ? (
                  <Toggle defaultOn={row.defaultOn} />
                ) : (
                  <span className="text-[12px] text-[(--text-gray)]">{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className="mx-5 mt-5 w-[calc(100%-2.5rem)] rounded-full border-[1.5px] border-[#f8d7da] bg-white py-3 text-[14px] text-red-600">
        Sign out
      </button>

      <BottomNav />
    </div>
  )
}