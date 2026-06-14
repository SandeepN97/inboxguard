import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'

export type AuthUser = {
  email: string
  name: string
  picture: string
}

export function useAuth() {
  return useQuery({
    queryKey: ['auth'],
    queryFn: () => client.get<AuthUser>('/auth/me').then((r) => r.data),
    retry: false,
    staleTime: 5 * 60_000,
  })
}
