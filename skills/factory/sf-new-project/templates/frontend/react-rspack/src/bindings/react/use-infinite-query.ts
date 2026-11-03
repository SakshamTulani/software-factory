import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react"
import type { InfiniteData, InfiniteQueryObserver, InfiniteQueryState } from "@/data"

/**
 * Subscribe to an InfiniteQueryObserver. Pass `null` to skip (e.g. a closed tab).
 */
export function useInfiniteQuery<TPage, TPageParam = unknown>(
  observer: InfiniteQueryObserver<TPage, TPageParam> | null | undefined
): InfiniteQueryState<TPage, TPageParam> & {
  fetchNextPage: () => Promise<InfiniteData<TPage, TPageParam> | undefined>
  refetch: () => Promise<InfiniteData<TPage, TPageParam> | undefined>
} {
  const emptyState: InfiniteQueryState<TPage, TPageParam> = useMemo(
    () => ({
      data: undefined,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      error: null,
      dataUpdatedAt: 0,
    }),
    []
  )

  const state = useSyncExternalStore(
    (onStoreChange: () => void) => (observer ? observer.subscribe(onStoreChange) : () => {}),
    () => (observer ? observer.getSnapshot() : emptyState)
  )

  useEffect(() => {
    observer?.mount()
    return () => observer?.unmount()
  }, [observer])

  const fetchNextPage = useCallback(
    () => (observer ? observer.fetchNextPage() : Promise.resolve(undefined)),
    [observer]
  )

  const refetch = useCallback(
    () => (observer ? observer.fetch({ force: true }) : Promise.resolve(undefined)),
    [observer]
  )

  return { ...state, fetchNextPage, refetch }
}
