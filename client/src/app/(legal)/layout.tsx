import DesktopSidebar from '@/components/ui/DesktopSidebar'
import BottomNav from '@/components/ui/BottomNav'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0 pb-24 md:pb-8 px-5 md:px-8 max-w-2xl moment-col moment-col--center w-full">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}