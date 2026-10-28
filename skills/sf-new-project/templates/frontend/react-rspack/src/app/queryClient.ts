import { QueryClient } from "@tanstack/react-query"

/**
 * The one cache every store writes into. Stores receive it in their deps
 * (see the frontend-architecture skill); components only read it through hooks.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
    },
  })
}

export const queryClient = createQueryClient()
