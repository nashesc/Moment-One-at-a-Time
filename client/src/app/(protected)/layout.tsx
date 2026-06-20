import DesktopSidebar from '@/components/ui/DesktopSidebar'
import BottomNav from '@/components/ui/BottomNav'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />
      {children}
      <BottomNav />
    </div>
  )
}