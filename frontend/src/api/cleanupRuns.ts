import type { CleanupMode, CleanupRun } from '@/types'
import client from './client'

export const cleanupRunsApi = {
  list: () => client.get<CleanupRun[]>('/runs').then((r) => r.data),

  get: (id: string) => client.get<CleanupRun>(`/runs/${id}`).then((r) => r.data),

  start: (mode: CleanupMode) => client.post<CleanupRun>('/runs', { mode }).then((r) => r.data),
}
