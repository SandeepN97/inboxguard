import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { senderRulesApi } from '@/api/senderRules'

const RULES_KEY = ['senderRules']

export function useSenderRules() {
  return useQuery({ queryKey: RULES_KEY, queryFn: senderRulesApi.list })
}

export function useCreateRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: senderRulesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: RULES_KEY }),
  })
}

export function useToggleRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      senderRulesApi.toggle(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: RULES_KEY }),
  })
}

export function useDeleteRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: senderRulesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: RULES_KEY }),
  })
}
