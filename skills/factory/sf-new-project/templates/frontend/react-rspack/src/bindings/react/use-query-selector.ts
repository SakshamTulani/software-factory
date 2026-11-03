import { useCallback, useEffect, useSyncExternalStore } from "react"

import type { QueryObserver } from "@/data"

/**
 * Like useQuery, but returns one slice of the data and re-renders only when that
 * slice changes. select must return a value already in the data (a stored
 * reference), never a new object or array, or React re-renders forever.
 */
export function useQuerySelector<TData, TSelected>(
  observer: QueryObserver<TData>,
  select: (data: TData | undefined) => TSelected
): TSelected {
  const subscribe = useCallback((onChange: () => void) => observer.subscribe(onChange), [observer])
  const selected = useSyncExternalStore(subscribe, () => select(observer.getSnapshot().data))

  useEffect(() => {
    observer.mount()
    return () => observer.unmount()
  }, [observer])

  return selected
}
