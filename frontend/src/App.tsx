import { motion } from 'motion/react'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'

export default function App() {
  const badgeRef = useRef<HTMLDivElement>(null)

  // GSAP for timeline-based entrance — Motion handles component transitions
  useEffect(() => {
    if (!badgeRef.current) return
    gsap.fromTo(
      badgeRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 0.4 }
    )
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-center"
      >
        <div ref={badgeRef} className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5">
          <span className="text-sm font-medium text-primary">Gmail Admin Tool</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-foreground">InboxGuard</h1>
        <p className="mt-3 text-muted-foreground">
          Automated Gmail inbox cleanup — dashboard loading…
        </p>
      </motion.main>
    </div>
  )
}
