import { QueryCache } from "./query-cache"
import type { QueryKey } from "./types"

/**
 * Base class for stores that need caching capabilities.
 * Exposes a protected `queryCache` instance.
 */
export abstract class BaseCacheStore {
  protected queryCache: QueryCache

  constructor() {
    this.queryCache = new QueryCache()
  }

  /**
   * Clear all cached queries for this store.
   */
  clearCache() {
    this.queryCache.clear()
  }

  /**
   * Invalidates cached queries matching the key prefix, forcing them to refetch.
   * Use this inside mutation methods (e.g., create, update, delete) to update the UI automatically.
   */
  invalidateQueries(queryKey: QueryKey) {
    this.queryCache.invalidateQueries(queryKey)
  }
  /**
   * Synchronously gets the current data for a query from the cache.
   */
  getQueryData<TData>(queryKey: QueryKey): TData | undefined {
    return this.queryCache.getQueryData<TData>(queryKey)
  }

  /**
   * Manually injects data into the cache without a network request.
   * Useful for Websocket deltas and Optimistic Updates.
   */
  setQueryData<TData>(
    queryKey: QueryKey,
    updater: TData | ((oldData: TData | undefined) => TData)
  ) {
    this.queryCache.setQueryData<TData>(queryKey, updater)
  }
}
