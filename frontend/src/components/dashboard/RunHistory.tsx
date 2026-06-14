import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCleanupRuns } from '@/hooks/useCleanupRuns'
import type { CleanupRun, CleanupStatus } from '@/types'

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatDuration(start: string, end: string | null) {
  if (!end) return null
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const secs = Math.floor(ms / 1000)
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

const statusConfig: Record<
  CleanupStatus,
  { icon: React.ElementType; variant: 'success' | 'destructive' | 'running'; label: string }
> = {
  COMPLETED: { icon: CheckCircle2, variant: 'success', label: 'Completed' },
  FAILED: { icon: XCircle, variant: 'destructive', label: 'Failed' },
  RUNNING: { icon: Loader2, variant: 'running', label: 'Running' },
}

export function RunHistory() {
  const { data: runs, isLoading, isError } = useCleanupRuns()

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold">Run History</h2>
        <p className="text-xs text-muted-foreground">{runs?.length ?? 0} runs recorded</p>
      </div>

      <div className="rounded-lg border">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Could not load history — backend offline?
          </p>
        )}
        {!isLoading && !isError && (!runs || runs.length === 0) && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No runs yet. Start your first cleanup run above.
          </p>
        )}
        {!isLoading && !isError && runs && runs.length > 0 && (
          <ul>
            {runs.map((run, i) => (
              <li key={run.id} className={i < runs.length - 1 ? 'border-b' : ''}>
                <RunRow run={run} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function RunRow({ run }: { run: CleanupRun }) {
  const { icon: Icon, variant, label } = statusConfig[run.status]
  const duration = formatDuration(run.startedAt, run.completedAt)
  const isRunning = run.status === 'RUNNING'

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon
        className={`h-4 w-4 shrink-0 ${
          variant === 'success'
            ? 'text-emerald-600'
            : variant === 'destructive'
              ? 'text-destructive'
              : 'animate-spin text-blue-600'
        }`}
      />

      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <Badge
            variant={run.mode === 'LIVE' ? 'destructive' : 'secondary'}
            className="text-[10px]"
          >
            {run.mode === 'DRY_RUN' ? 'DRY RUN' : 'LIVE'}
          </Badge>
          <Badge variant={variant}>{label}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {run.emailsDeleted.toLocaleString()} deleted · {run.emailsProcessed.toLocaleString()}{' '}
          processed
          {duration && ` · ${duration}`}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        {isRunning && <Clock className="h-3 w-3" />}
        <span>{formatRelative(run.startedAt)}</span>
      </div>
    </div>
  )
}
