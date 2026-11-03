import { useCallback, useState } from "react"

export interface UseMutationOptions<TData = unknown, TVariables = void> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
}

/**
 * Hook to manage the state of a mutation (create, update, delete).
 */
export function useMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TVariables>
) {
  const [isPending, setIsPending] = useState(false)
  const [variables, setVariables] = useState<TVariables | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const mutateAsync = useCallback(
    async (inputVariables: TVariables) => {
      setIsPending(true)
      setVariables(inputVariables)
      setError(null)
      try {
        const data = await mutationFn(inputVariables)
        options?.onSuccess?.(data, inputVariables)
        return data
      } catch (err) {
        const parsedError = err instanceof Error ? err : new Error(String(err))
        setError(parsedError)
        options?.onError?.(parsedError, inputVariables)
        throw parsedError
      } finally {
        setIsPending(false)
        setVariables(null)
      }
    },
    [mutationFn, options]
  )

  const mutate = useCallback(
    (inputVariables: TVariables) => {
      mutateAsync(inputVariables).catch((err: unknown) => {
        console.error("Mutation failed:", err)
      })
    },
    [mutateAsync]
  )

  return { mutate, mutateAsync, isPending, variables, error }
}
