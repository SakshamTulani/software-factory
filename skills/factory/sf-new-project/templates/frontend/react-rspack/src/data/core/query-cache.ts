import { InfiniteQueryObserver } from "./infinite-query-observer"
import { QueryObserver } from "./query-observer"
import type { InfiniteFetcher, InfiniteQueryOptions, QueryKey, QueryOptions } from "./types"

export function hashQueryKey(queryKey: QueryKey): string {
  return typeof queryKey === "string" ? queryKey : JSON.stringify(queryKey)
}

/**
 * Checks if targetKey starts with the filterKey exactly.
 * For arrays, filterKey must be a prefix array of targetKey.
 */
export function matchQueryKey(filterKey: QueryKey, targetKey: QueryKey): boolean {
  if (typeof filterKey === "string" || typeof targetKey === "string") {
    // If either is a string, fall back to simple string prefix matching on the hash
    return hashQueryKey(targetKey).startsWith(hashQueryKey(filterKey))
  }
  // Array prefix matching (like React Query)
  if (filterKey.length > targetKey.length) return false
  return filterKey.every((val, index) => JSON.stringify(val) === JSON.stringify(targetKey[index]))
}

export class QueryCache {
  private observers = new Map<string, QueryObserver<unknown>>()
  private infiniteObservers = new Map<string, InfiniteQueryObserver<unknown, unknown>>()
  private gcTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private defaultGcTime = 2 * 60 * 1000 // 2 minutes default

  /**
   * Retrieves an existing observer for the given key or creates a new one.
   */
  getQuery<TData>(
    queryKey: QueryKey,
    fetcher: (params: { signal: AbortSignal }) => Promise<TData>,
    options?: QueryOptions
  ): QueryObserver<TData> {
    const keyHash = hashQueryKey(queryKey)

    // If there's a pending GC timer, clear it because the query is being reused
    if (this.gcTimers.has(keyHash)) {
      clearTimeout(this.gcTimers.get(keyHash))
      this.gcTimers.delete(keyHash)
    }

    if (!this.observers.has(keyHash)) {
      const observer = new QueryObserver<TData>(queryKey, keyHash, fetcher, options, () => {
        // Start GC timer when subscribers drop to 0
        const gcTime = options?.gcTime ?? this.defaultGcTime
        const timer = setTimeout(() => {
          this.gcTimers.delete(keyHash)
          // A component may have mounted again without calling getQuery (StrictMode).
          if (observer.refCount === 0) this.removeQuery(keyHash)
        }, gcTime)
        this.gcTimers.set(keyHash, timer)
      })
      this.observers.set(keyHash, observer as QueryObserver<unknown>)
    }
    return this.observers.get(keyHash) as QueryObserver<TData>
  }

  getInfiniteQuery<TPage, TPageParam>(
    queryKey: QueryKey,
    fetcher: InfiniteFetcher<TPage, TPageParam>,
    options: InfiniteQueryOptions<TPage, TPageParam>
  ): InfiniteQueryObserver<TPage, TPageParam> {
    const keyHash = hashQueryKey(queryKey)

    if (this.gcTimers.has(keyHash)) {
      clearTimeout(this.gcTimers.get(keyHash))
      this.gcTimers.delete(keyHash)
    }

    if (!this.infiniteObservers.has(keyHash)) {
      const observer = new InfiniteQueryObserver<TPage, TPageParam>(
        queryKey,
        keyHash,
        fetcher,
        options,
        () => {
          const gcTime = options.gcTime ?? this.defaultGcTime
          const timer = setTimeout(() => {
            this.gcTimers.delete(keyHash)
            // A component may have mounted again without calling getQuery (StrictMode).
            if (observer.refCount === 0) this.removeQuery(keyHash)
          }, gcTime)
          this.gcTimers.set(keyHash, timer)
        }
      )
      this.infiniteObservers.set(keyHash, observer as InfiniteQueryObserver<unknown, unknown>)
    }
    return this.infiniteObservers.get(keyHash) as InfiniteQueryObserver<TPage, TPageParam>
  }

  /**
   * Invalidates queries that match the given key prefix.
   * If a query has active subscribers, it is forcefully refetched.
   * If it has no active subscribers, it is removed from the cache so the next mount gets fresh data.
   */
  invalidateQueries(queryKey: QueryKey) {
    this.observers.forEach((observer, keyHash) => {
      if (matchQueryKey(queryKey, observer.queryKey)) {
        if (observer.refCount > 0) {
          observer.fetch({ force: true }).catch((err) => {
            console.error(`[QueryCache] Failed to invalidate query ${keyHash}:`, err)
          })
        } else {
          this.removeQuery(keyHash)
        }
      }
    })
    this.infiniteObservers.forEach((observer, keyHash) => {
      if (matchQueryKey(queryKey, observer.queryKey)) {
        if (observer.refCount > 0) {
          observer.fetch({ force: true }).catch((err) => {
            console.error(`[QueryCache] Failed to invalidate infinite query ${keyHash}:`, err)
          })
        } else {
          this.removeQuery(keyHash)
        }
      }
    })
  }

  /**
   * Synchronously gets the current data for a query.
   */
  getQueryData<TData>(queryKey: QueryKey): TData | undefined {
    const keyHash = hashQueryKey(queryKey)
    const observer = this.observers.get(keyHash)
    return observer?.getSnapshot().data as TData | undefined
  }

  /**
   * Manually sets the data for a query and notifies subscribers.
   * If the observer doesn't exist, it creates a placeholder one.
   */
  setQueryData<TData>(
    queryKey: QueryKey,
    updater: TData | ((oldData: TData | undefined) => TData)
  ) {
    const keyHash = hashQueryKey(queryKey)
    let observer = this.observers.get(keyHash) as QueryObserver<TData> | undefined

    if (!observer) {
      // Create a placeholder observer if setting data before it's ever fetched
      observer = new QueryObserver<TData>(
        queryKey,
        keyHash,
        () => new Promise(() => {}) // Dummy fetcher
      )
      this.observers.set(keyHash, observer as QueryObserver<unknown>)
    }

    const currentData = observer.getSnapshot().data
    const newData =
      typeof updater === "function"
        ? (updater as (oldData: TData | undefined) => TData)(currentData)
        : updater
    observer.setData(newData)
  }

  /**
   * Removes a query from the cache and cleans up its listeners.
   */
  removeQuery(keyHash: string) {
    const observer = this.observers.get(keyHash)
    if (observer) {
      observer.destroy()
      this.observers.delete(keyHash)
    }
    const infiniteObserver = this.infiniteObservers.get(keyHash)
    if (infiniteObserver) {
      infiniteObserver.destroy()
      this.infiniteObservers.delete(keyHash)
    }
    if (this.gcTimers.has(keyHash)) {
      clearTimeout(this.gcTimers.get(keyHash))
      this.gcTimers.delete(keyHash)
    }
  }

  clear() {
    this.observers.forEach((observer) => {
      observer.destroy()
    })
    this.observers.clear()
    this.infiniteObservers.forEach((observer) => {
      observer.destroy()
    })
    this.infiniteObservers.clear()
    this.gcTimers.forEach((timer) => {
      clearTimeout(timer)
    })
    this.gcTimers.clear()
  }
}
