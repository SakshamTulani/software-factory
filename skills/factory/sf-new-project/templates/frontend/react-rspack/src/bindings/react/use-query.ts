import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react"
import type { QueryObserver, QueryState } from "@/data"

/**
 * Hook to subscribe to a QueryObserver.
 * Handles React lifecycle (mount/unmount) to trigger fetches and manage refCounts.
 * Pass `null` or `undefined` to skip the query.
 */
export function useQuery<TData>(
  observer: QueryObserver<TData> | null | undefined
): QueryState<TData> & {
  /** No data or error yet and the first fetch hasn't settled (true before mount's fetch starts). */
  isPending: boolean
  refetch: () => Promise<TData | undefined>
} {
  // Empty state when observer is null
  const emptyState: QueryState<TData> = useMemo(
    () => ({
      data: undefined,
      isLoading: false,
      error: null,
      dataUpdatedAt: 0,
    }),
    []
  )

  // Subscribe to state changes from the observer
  const state = useSyncExternalStore(
    (onStoreChange: () => void) => (observer ? observer.subscribe(onStoreChange) : () => {}),
    () => (observer ? observer.getSnapshot() : emptyState)
  )

  useEffect(() => {
    observer?.mount()
    return () => observer?.unmount()
  }, [observer])

  const refetch = useCallback(
    () => (observer ? observer.fetch({ force: true }) : Promise.resolve(undefined)),
    [observer]
  )

  const isPending =
    observer != null &&
    state.data === undefined &&
    state.error == null &&
    (state.isLoading || state.dataUpdatedAt === 0)

  return { ...state, isPending, refetch }
}
