import DesktopSidebar from '@/components/ui/DesktopSidebar'
import BottomNav from '@/components/ui/BottomNav'
import { CreateTaskSheetProvider } from '@/context/CreateTaskSheetContext'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreateTaskSheetProvider>
      <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
        <DesktopSidebar />
        {children}
        <BottomNav />
      </div>
    </CreateTaskSheetProvider>
  )
}