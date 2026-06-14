import { motion } from 'motion/react'
import { FlaskConical, SlidersHorizontal, History, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const FEATURES = [
  {
    icon: FlaskConical,
    title: 'Dry Run Mode',
    description:
      'Preview exactly which emails would be deleted before touching a single one. Safe by default.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Granular Rules',
    description:
      'Target by exact address or entire domain. Toggle rules on/off without losing them.',
  },
  {
    icon: History,
    title: 'Full Audit Trail',
    description: 'Every cleanup run is logged: mode, timestamp, emails processed, emails deleted.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by Design',
    description: 'OAuth2 tokens are AES-256-GCM encrypted at rest. No passwords stored, ever.',
  },
]

export function FeatureCards() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary/60">
            Features
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Built for control</h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="flex-row items-start gap-3 pb-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="mt-1 text-sm font-semibold text-foreground">
                    {f.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
