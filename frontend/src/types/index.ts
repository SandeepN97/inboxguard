export type SenderRule = {
  id: string
  sender: string
  active: boolean
  createdAt: string
}

export type CleanupMode = 'DRY_RUN' | 'LIVE'
export type CleanupStatus = 'RUNNING' | 'COMPLETED' | 'FAILED'

export type CleanupRun = {
  id: string
  mode: CleanupMode
  status: CleanupStatus
  startedAt: string
  completedAt: string | null
  emailsProcessed: number
  emailsDeleted: number
}
