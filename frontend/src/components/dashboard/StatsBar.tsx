import { ListFilter, Clock, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSenderRules } from '@/hooks/useSenderRules'
import { useCleanupRuns } from '@/hooks/useCleanupRuns'

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function StatsBar() {
  const { data: rules } = useSenderRules()
  const { data: runs } = useCleanupRuns()

  const activeRules = rules?.filter((r) => r.active).length ?? 0
  const lastRun = runs?.[0]
  const totalDeleted = runs?.reduce((sum, r) => sum + r.emailsDeleted, 0) ?? 0

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        icon={ListFilter}
        title="Active Rules"
        value={activeRules}
        sub={`${rules?.length ?? 0} total`}
      />
      <StatCard
        icon={Clock}
        title="Last Run"
        value={lastRun ? formatRelative(lastRun.startedAt) : '—'}
        sub={lastRun ? lastRun.mode.replace('_', ' ') : 'No runs yet'}
      />
      <StatCard
        icon={Trash2}
        title="Emails Cleaned"
        value={totalDeleted.toLocaleString()}
        sub="all time"
      />
    </div>
  )
}

function StatCard({
  icon: Icon,
  title,
  value,
  sub,
}: {
  icon: React.ElementType
  title: string
  value: string | number
  sub: string
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}
