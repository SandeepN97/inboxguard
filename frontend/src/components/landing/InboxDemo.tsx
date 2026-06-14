import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Mail, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type MockEmail = {
  id: number
  from: string
  subject: string
  time: string
  targeted: boolean
}

const EMAILS: MockEmail[] = [
  {
    id: 1,
    from: 'noreply@github.com',
    subject: '23 new notifications',
    time: '9:14 AM',
    targeted: true,
  },
  { id: 2, from: 'me@personal.com', subject: 'Lunch tomorrow?', time: '8:52 AM', targeted: false },
  {
    id: 3,
    from: 'newsletter@medium.com',
    subject: "This week's top stories",
    time: '8:31 AM',
    targeted: true,
  },
  { id: 4, from: 'boss@company.com', subject: 'Q4 planning doc', time: '8:10 AM', targeted: false },
  {
    id: 5,
    from: 'noreply@linkedin.com',
    subject: '15 people viewed your profile',
    time: 'Yesterday',
    targeted: true,
  },
  {
    id: 6,
    from: 'updates@notion.so',
    subject: 'Weekly digest for your team',
    time: 'Yesterday',
    targeted: true,
  },
  {
    id: 7,
    from: 'friend@gmail.com',
    subject: 'Photos from the trip!',
    time: 'Mon',
    targeted: false,
  },
  {
    id: 8,
    from: 'offers@amazon.com',
    subject: 'Your exclusive deals today',
    time: 'Mon',
    targeted: true,
  },
]

const TARGETED_COUNT = EMAILS.filter((e) => e.targeted).length

export function InboxDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const badgeRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')

  useEffect(() => {
    const targeted = rowRefs.current.filter((_, i) => EMAILS[i]?.targeted)
    const all = rowRefs.current.filter(Boolean)

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 })

    // Phase 1: stagger emails in
    tl.fromTo(
      all,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, stagger: 0.07, duration: 0.35, ease: 'power2.out' }
    )

    // Phase 2: show "running" badge
    tl.fromTo(
      badgeRef.current,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.25 },
      '+=1.2'
    )
    tl.add(() => setPhase('running'))

    // Phase 3: highlight targeted rows
    tl.to(
      targeted,
      { backgroundColor: 'rgb(254 242 242)', outlineColor: 'rgb(252 165 165)', duration: 0.3 },
      '+=0.4'
    )

    // Phase 4: delete targeted rows
    tl.to(
      targeted,
      {
        x: -32,
        opacity: 0,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        marginBottom: 0,
        stagger: 0.1,
        duration: 0.3,
        ease: 'power2.in',
        onStart: () => {
          const obj = { n: 0 }
          gsap.to(obj, {
            n: TARGETED_COUNT,
            duration: 0.8,
            ease: 'power1.out',
            onUpdate: () => setCount(Math.round(obj.n)),
            onComplete: () => setPhase('done'),
          })
        },
      },
      '+=0.2'
    )

    // Phase 5: show counter
    tl.fromTo(
      counterRef.current,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.5)' }
    )

    // Phase 6: reset
    tl.to([...all, badgeRef.current, counterRef.current], { opacity: 0, duration: 0.4 }, '+=2.5')
    tl.add(() => {
      setPhase('idle')
      setCount(0)
      gsap.set(all, { clearProps: 'all' })
    })

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl border bg-background shadow-2xl"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-muted-foreground">Gmail — Inbox</span>

        {/* Running badge */}
        <div ref={badgeRef} className="ml-auto opacity-0">
          <Badge variant="running" className="gap-1 text-[11px]">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
            {phase === 'done' ? 'Done' : 'Cleaning…'}
          </Badge>
        </div>
      </div>

      {/* Email rows */}
      <div className="divide-y">
        {EMAILS.map((email, i) => (
          <div
            key={email.id}
            ref={(el) => {
              rowRefs.current[i] = el
            }}
            className="flex items-center gap-3 overflow-hidden px-4 py-3 outline outline-1 outline-transparent"
          >
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-xs font-medium ${email.targeted ? 'text-muted-foreground' : 'text-foreground'}`}
              >
                {email.from}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">{email.subject}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{email.time}</span>
              {email.targeted && <Trash2 className="h-3 w-3 text-red-400/60" />}
            </div>
          </div>
        ))}
      </div>

      {/* Counter overlay */}
      <div
        ref={counterRef}
        className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center opacity-0"
      >
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 shadow-lg">
          <Trash2 className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">{count} emails removed</span>
        </div>
      </div>
    </div>
  )
}
