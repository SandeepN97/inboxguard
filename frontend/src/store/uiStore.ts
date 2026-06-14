import { create } from 'zustand'
import type { CleanupMode } from '@/types'

type UiState = {
  sidebarCollapsed: boolean
  mode: CleanupMode
  activeRunId: string | null
  toggleSidebar: () => void
  setMode: (mode: CleanupMode) => void
  setActiveRunId: (id: string | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  mode: 'DRY_RUN',
  activeRunId: null,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMode: (mode) => set({ mode }),
  setActiveRunId: (activeRunId) => set({ activeRunId }),
}))
