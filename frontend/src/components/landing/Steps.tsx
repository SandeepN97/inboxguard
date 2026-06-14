import { motion } from 'motion/react'
import { LinkIcon, ListFilter, Play } from 'lucide-react'

const STEPS = [
  {
    icon: LinkIcon,
    number: '01',
    title: 'Connect Gmail',
    description:
      'One-click OAuth2 sign-in. InboxGuard reads your inbox with read-only scope — nothing is touched until you say so.',
  },
  {
    icon: ListFilter,
    number: '02',
    title: 'Define Rules',
    description:
      'Add senders you want gone: newsletters, notification blasts, marketing lists. Exact addresses or full domains.',
  },
  {
    icon: Play,
    number: '03',
    title: 'Run a Cleanup',
    description:
      "Start with a dry run to preview what would be deleted. Flip to live mode when you're ready to actually clean.",
  },
]

export function Steps() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary/60">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Three steps to a clean inbox</h2>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-border md:block" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative flex flex-col items-start gap-4"
            >
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-background shadow-sm">
                <step.icon className="h-6 w-6 text-primary" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
