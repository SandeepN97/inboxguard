import { Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Landing } from '@/pages/Landing'
import { Dashboard } from '@/pages/Dashboard'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Shield className="h-8 w-8 animate-pulse text-primary" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}

export default function App() {
  const { data: user, isLoading, isError } = useAuth()
  const isSigningIn = new URLSearchParams(window.location.search).has('signing_in')

  if (isLoading) return <LoadingScreen />
  if (isError || !user) return <Landing isSigningIn={isSigningIn} />
  return <Dashboard user={user} />
}
