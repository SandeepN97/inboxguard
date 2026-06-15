import { Routes, Route, useSearchParams } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Landing } from '@/pages/Landing'
import { Dashboard } from '@/pages/Dashboard'
import { BlogList } from '@/pages/BlogList'
import { BlogPost } from '@/pages/BlogPost'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Shield className="h-8 w-8 animate-pulse text-primary" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}

function AuthGate() {
  const { data: user, isLoading, isError } = useAuth()
  const [params] = useSearchParams()
  const isSigningIn = params.has('signing_in')

  if (isLoading) return <LoadingScreen />
  if (isError || !user) return <Landing isSigningIn={isSigningIn} />
  return <Dashboard user={user} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="*" element={<AuthGate />} />
    </Routes>
  )
}
