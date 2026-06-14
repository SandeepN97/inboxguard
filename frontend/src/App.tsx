import { motion } from 'motion/react'
import { Layout } from '@/components/layout/Layout'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { RunControls, LiveModeBanner } from '@/components/dashboard/RunControls'
import { SenderRulesTable } from '@/components/dashboard/SenderRulesTable'
import { RunHistory } from '@/components/dashboard/RunHistory'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

export default function App() {
  return (
    <Layout>
      <div className="flex h-14 shrink-0 items-center border-b px-6">
        <h1 className="text-sm font-semibold">Dashboard</h1>
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
