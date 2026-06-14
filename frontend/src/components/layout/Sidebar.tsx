import { motion, AnimatePresence } from 'motion/react'
import { LayoutDashboard, ListFilter, History, ChevronLeft, Shield } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type NavItem = { label: string; icon: React.ElementType }

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Rules', icon: ListFilter },
  { label: 'History', icon: History },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="relative flex h-screen flex-col border-r bg-background"
    >
      <div className="flex h-14 items-center border-b px-4">
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <Shield className="h-5 w-5 shrink-0 text-primary" />
              <span className="whitespace-nowrap font-semibold tracking-tight">InboxGuard</span>
            </motion.div>
          )}
          {sidebarCollapsed && (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Shield className="h-5 w-5 text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2 pt-4">
        {navItems.map(({ label, icon: Icon }) => (
          <NavLink key={label} label={label} icon={Icon} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-[3.5rem] z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <motion.span
          animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
          transition={{ duration: 0.22 }}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </motion.span>
      </button>
    </motion.aside>
  )
}

function NavLink({
  label,
  icon: Icon,
  collapsed,
}: {
  label: string
  icon: React.ElementType
  collapsed: boolean
}) {
  const isActive = label === 'Dashboard'

  const inner = (
    <button
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
        isActive
          ? 'bg-primary/10 font-medium text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        collapsed && 'justify-center'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )

  if (!collapsed) return inner

  return (
    <Tooltip>
      <TooltipTrigger asChild>{inner}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}
