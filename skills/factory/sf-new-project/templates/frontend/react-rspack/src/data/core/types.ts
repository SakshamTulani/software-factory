export type QueryKey = string | readonly unknown[]

export interface QueryOptions {
  /** Time-To-Live in milliseconds. How long the cache stays fresh. */
  ttl?: number
  /** Time in milliseconds to keep the query in memory after subscribers reach 0. Default is 5 mins. */
  gcTime?: number
  /** Callback fired when the first component subscribes (refCount becomes 1). Useful for opening WS channels. */
  onSubscribe?: () => void
  /** Callback fired when the last component unsubscribes (refCount becomes 0). Useful for closing WS channels. */
  onUnsubscribe?: () => void
}

export interface QueryState<TData = unknown> {
  data: TData | undefined
  isLoading: boolean
  error: Error | null
  dataUpdatedAt: number
}

export type FetchOptions = {
  /** If true, bypasses the cache and TTL check, forcing a network request. */
  force?: boolean
}

export type InfiniteData<TPage, TPageParam = unknown> = {
  pages: TPage[]
  pageParams: TPageParam[]
}

export interface InfiniteQueryState<TPage = unknown, TPageParam = unknown> {
  data: InfiniteData<TPage, TPageParam> | undefined
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  error: Error | null
  dataUpdatedAt: number
}

export type InfiniteFetcher<TPage, TPageParam> = (params: {
  pageParam: TPageParam
  signal: AbortSignal
}) => Promise<TPage>

export interface InfiniteQueryOptions<TPage, TPageParam> extends QueryOptions {
  initialPageParam: TPageParam
  getNextPageParam: (
    lastPage: TPage,
    allPages: TPage[],
    lastPageParam: TPageParam,
    allPageParams: TPageParam[]
  ) => TPageParam | null | undefined
}
