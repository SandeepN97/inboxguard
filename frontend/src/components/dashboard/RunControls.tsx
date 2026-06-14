import { Play, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUiStore } from '@/store/uiStore'
import { useStartRun, useActiveRun } from '@/hooks/useCleanupRuns'
import { useToast } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

export function RunControls() {
  const { mode, setMode, activeRunId } = useUiStore()
  const { data: activeRun } = useActiveRun()
  const startRun = useStartRun()
  const { toast } = useToast()

  const isRunning = activeRunId !== null && activeRun?.status === 'RUNNING'

  async function handleStart() {
    try {
      await startRun.mutateAsync(mode)
      toast({ title: `${mode === 'DRY_RUN' ? 'Dry run' : 'Live run'} started` })
    } catch {
      toast({ title: 'Failed to start run', variant: 'destructive' })
    }
  }

  return (
    <div className="bg-card flex items-center justify-between rounded-lg border p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Run Mode</p>
        <p className="text-xs text-muted-foreground">
          {mode === 'DRY_RUN'
            ? 'Simulates cleanup — no emails deleted'
            : 'Live mode — emails will be permanently deleted'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle mode={mode} onChange={setMode} disabled={isRunning} />

        {isRunning ? (
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Running… {activeRun?.emailsProcessed ?? 0} processed</span>
          </div>
        ) : (
          <Button onClick={handleStart} disabled={startRun.isPending} size="sm">
            {startRun.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Start {mode === 'DRY_RUN' ? 'Dry Run' : 'Live Run'}
          </Button>
        )}
      </div>
    </div>
  )
}

function ModeToggle({
  mode,
  onChange,
  disabled,
}: {
  mode: 'DRY_RUN' | 'LIVE'
  onChange: (m: 'DRY_RUN' | 'LIVE') => void
  disabled: boolean
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border p-1">
      <button
        onClick={() => onChange('DRY_RUN')}
        disabled={disabled}
        className={cn(
          'rounded-full px-3 py-1 text-xs font-medium transition-colors',
          mode === 'DRY_RUN'
            ? 'bg-secondary text-secondary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Dry Run
      </button>
      <button
        onClick={() => onChange('LIVE')}
        disabled={disabled}
        className={cn(
          'rounded-full px-3 py-1 text-xs font-medium transition-colors',
          mode === 'LIVE'
            ? 'bg-destructive text-destructive-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Live
      </button>
    </div>
  )
}

export function LiveModeBanner() {
  const mode = useUiStore((s) => s.mode)
  if (mode !== 'LIVE') return null
  return (
    <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>
        <strong>Live mode active.</strong> Starting a run will permanently delete matching emails.
      </span>
      <Badge variant="destructive" className="ml-auto">
        LIVE
      </Badge>
    </div>
  )
}
