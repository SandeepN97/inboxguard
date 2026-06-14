import { motion } from 'motion/react'
import { LogOut } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { RunControls, LiveModeBanner } from '@/components/dashboard/RunControls'
import { SenderRulesTable } from '@/components/dashboard/SenderRulesTable'
import { RunHistory } from '@/components/dashboard/RunHistory'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { AuthUser } from '@/hooks/useAuth'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

export function Dashboard({ user }: { user: AuthUser }) {
  const qc = useQueryClient()

  async function handleLogout() {
    await client.post('/auth/logout').catch(() => null)
    qc.clear()
    window.location.href = '/'
  }

  return (
    <Layout>
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <h1 className="text-sm font-semibold">Dashboard</h1>

        <div className="flex items-center gap-3">
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
            />
          )}
          <span className="hidden text-sm text-muted-foreground sm:block">{user.name}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sign out</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-auto p-6">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0 }}>
          <StatsBar />
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }}>
          <LiveModeBanner />
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <RunControls />
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.16 }}>
          <SenderRulesTable />
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.22 }}>
          <RunHistory />
        </motion.div>
      </div>
    </Layout>
  )
}
