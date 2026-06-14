import type { SenderRule } from '@/types'
import client from './client'

export const senderRulesApi = {
  list: () => client.get<SenderRule[]>('/rules').then((r) => r.data),

  create: (sender: string) => client.post<SenderRule>('/rules', { sender }).then((r) => r.data),

  toggle: (id: string, active: boolean) =>
    client.patch<SenderRule>(`/rules/${id}`, { active }).then((r) => r.data),

  remove: (id: string) => client.delete(`/rules/${id}`),
}
