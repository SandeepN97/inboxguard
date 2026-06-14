import { motion } from 'motion/react'
import { Shield, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InboxDemo } from '@/components/landing/InboxDemo'
import { Steps } from '@/components/landing/Steps'
import { FeatureCards } from '@/components/landing/FeatureCards'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

const STATS = [
  { value: '10k+', label: 'Emails cleaned' },
  { value: '<1s', label: 'Per batch operation' },
  { value: '100%', label: 'Dry-run safe' },
]

export function Landing({ isSigningIn = false }: { isSigningIn?: boolean }) {
  function handleSignIn() {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold tracking-tight">InboxGuard</span>
          </div>
          <Button size="sm" onClick={handleSignIn} disabled={isSigningIn}>
            {isSigningIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Sign in with Google
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Gmail inbox automation
            </div>

            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
              Your inbox,
              <br />
              <span className="text-primary/80">finally quiet.</span>
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
              InboxGuard automatically removes bulk email from the senders you choose — newsletters,
              notifications, marketing blasts. Set rules once, run cleanup whenever you want.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={handleSignIn} disabled={isSigningIn} className="gap-2">
                {isSigningIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Connect Gmail — it's free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="self-center text-xs text-muted-foreground">
                No credit card · OAuth2 · Read-only until you run
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8 border-t pt-6">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: animated inbox */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          >
            <InboxDemo />
          </motion.div>
        </div>
      </section>

      <Steps />
      <FeatureCards />

      {/* Bottom CTA */}
      <section className="py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-2xl px-6 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight">Ready for a clean inbox?</h2>
          <p className="mt-3 text-muted-foreground">
            Connect in 30 seconds. Start with a dry run — zero risk.
          </p>
          <Button size="lg" onClick={handleSignIn} disabled={isSigningIn} className="mt-8 gap-2">
            {isSigningIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Get started with Google
          </Button>
        </motion.div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span>InboxGuard — built for learning, ready for production.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
