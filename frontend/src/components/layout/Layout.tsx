import { Sidebar } from './Sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ToastProvider } from '@/components/ui/toaster'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <TooltipProvider delayDuration={300}>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <main className="flex flex-1 flex-col overflow-auto">{children}</main>
        </div>
      </TooltipProvider>
    </ToastProvider>
  )
}
