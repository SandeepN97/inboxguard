import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cleanupRunsApi } from '@/api/cleanupRuns'
import { useUiStore } from '@/store/uiStore'
import type { CleanupStatus } from '@/types'

const RUNS_KEY = ['cleanupRuns']

export function useCleanupRuns() {
  return useQuery({ queryKey: RUNS_KEY, queryFn: cleanupRunsApi.list })
}

export function useActiveRun() {
  const activeRunId = useUiStore((s) => s.activeRunId)
  const setActiveRunId = useUiStore((s) => s.setActiveRunId)
  const qc = useQueryClient()

  return useQuery({
    queryKey: ['activeRun', activeRunId],
    queryFn: () => cleanupRunsApi.get(activeRunId!),
    enabled: activeRunId !== null,
    refetchInterval: (query) => {
      const status: CleanupStatus | undefined = query.state.data?.status
      if (status === 'RUNNING') return 3_000
      if (status === 'COMPLETED' || status === 'FAILED') {
        setActiveRunId(null)
        qc.invalidateQueries({ queryKey: RUNS_KEY })
      }
      return false
    },
  })
}

export function useStartRun() {
  const setActiveRunId = useUiStore((s) => s.setActiveRunId)
  const qc = useQueryClient()

  return useMutation({
    mutationFn: cleanupRunsApi.start,
    onSuccess: (run) => {
      setActiveRunId(run.id)
      qc.invalidateQueries({ queryKey: RUNS_KEY })
    },
  })
}
