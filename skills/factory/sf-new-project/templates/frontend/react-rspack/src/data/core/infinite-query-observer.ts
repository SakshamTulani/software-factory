import type {
  FetchOptions,
  InfiniteData,
  InfiniteFetcher,
  InfiniteQueryOptions,
  InfiniteQueryState,
  QueryKey,
} from "./types"

function isAbortError(error: unknown) {
  // fetch rejects with an AbortError DOMException; axios with a CanceledError.
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "CanceledError")
  )
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error))
}

export class InfiniteQueryObserver<TPage = unknown, TPageParam = unknown> {
  private state: InfiniteQueryState<TPage, TPageParam>
  private listeners: Set<() => void>
  private fetcher: InfiniteFetcher<TPage, TPageParam>
  private options: InfiniteQueryOptions<TPage, TPageParam>
  private fetchPromise: Promise<InfiniteData<TPage, TPageParam>> | null = null
  private abortController: AbortController | null = null
  private onUnsubscribe?: () => void

  public queryKey: QueryKey
  public keyHash: string
  public refCount = 0

  constructor(
    queryKey: QueryKey,
    keyHash: string,
    fetcher: InfiniteFetcher<TPage, TPageParam>,
    options: InfiniteQueryOptions<TPage, TPageParam>,
    onUnsubscribe?: () => void
  ) {
    this.queryKey = queryKey
    this.keyHash = keyHash
    this.fetcher = fetcher
    this.options = options
    this.onUnsubscribe = onUnsubscribe
    this.listeners = new Set()
    this.state = {
      data: undefined,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      error: null,
      dataUpdatedAt: 0,
    }
  }

  getSnapshot(): InfiniteQueryState<TPage, TPageParam> {
    return this.state
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => {
      listener()
    })
  }

  private setState(partial: Partial<InfiniteQueryState<TPage, TPageParam>>) {
    this.state = { ...this.state, ...partial }
    this.notify()
  }

  private isStale() {
    if (!this.options.ttl) return true
    return Date.now() - this.state.dataUpdatedAt > this.options.ttl
  }

  private hasMore(
    lastPage: TPage,
    pages: TPage[],
    lastPageParam: TPageParam,
    pageParams: TPageParam[]
  ) {
    return this.options.getNextPageParam(lastPage, pages, lastPageParam, pageParams) != null
  }

  private nextPageParam() {
    const data = this.state.data
    if (!data || data.pages.length === 0) return undefined
    const lastIndex = data.pages.length - 1
    const lastPage = data.pages[lastIndex]
    const lastPageParam = data.pageParams[lastIndex]
    if (lastPage === undefined || lastPageParam === undefined) return undefined
    return this.options.getNextPageParam(lastPage, data.pages, lastPageParam, data.pageParams)
  }

  async fetch(fetchOpts?: FetchOptions): Promise<InfiniteData<TPage, TPageParam>> {
    if (!fetchOpts?.force && !this.isStale() && this.state.data !== undefined) {
      return this.state.data
    }

    if (this.fetchPromise && !fetchOpts?.force) {
      return this.fetchPromise
    }

    if (this.fetchPromise && fetchOpts?.force) {
      this.abortController?.abort()
    }

    this.setState({
      isLoading: this.state.data === undefined,
      isFetchingNextPage: false,
      error: null,
    })

    return this.runFetch({
      pageParam: this.options.initialPageParam,
      replace: true,
    })
  }

  async fetchNextPage(): Promise<InfiniteData<TPage, TPageParam> | undefined> {
    if (this.state.data === undefined) {
      return this.fetch()
    }

    if (this.fetchPromise && !this.state.isFetchingNextPage) {
      return this.fetchPromise
    }

    if (this.fetchPromise && this.state.isFetchingNextPage) {
      return this.fetchPromise
    }

    const pageParam = this.nextPageParam()
    if (pageParam == null) {
      this.setState({ hasNextPage: false })
      return this.state.data
    }

    this.setState({ isFetchingNextPage: true, error: null })
    return this.runFetch({ pageParam, replace: false })
  }

  private runFetch({
    pageParam,
    replace,
  }: {
    pageParam: TPageParam
    replace: boolean
  }): Promise<InfiniteData<TPage, TPageParam>> {
    const currentController = new AbortController()
    this.abortController = currentController

    this.fetchPromise = this.fetcher({
      pageParam,
      signal: currentController.signal,
    })
      .then((page) => {
        const prev = replace ? undefined : this.state.data
        const pages = replace ? [page] : [...(prev?.pages ?? []), page]
        const pageParams = replace ? [pageParam] : [...(prev?.pageParams ?? []), pageParam]
        const lastPage = pages[pages.length - 1]
        const lastPageParam = pageParams[pageParams.length - 1]
        const data = { pages, pageParams }
        this.setState({
          data,
          isLoading: false,
          isFetchingNextPage: false,
          hasNextPage:
            lastPage !== undefined && lastPageParam !== undefined
              ? this.hasMore(lastPage, pages, lastPageParam, pageParams)
              : false,
          error: null,
          dataUpdatedAt: Date.now(),
        })
        return data
      })
      .catch((error) => {
        if (isAbortError(error)) {
          return Promise.reject(error)
        }
        this.setState({
          isLoading: false,
          isFetchingNextPage: false,
          error: toError(error),
        })
        throw error
      })
      .finally(() => {
        if (this.abortController === currentController) {
          this.fetchPromise = null
        }
      })

    return this.fetchPromise
  }

  setData(data: InfiniteData<TPage, TPageParam>) {
    const lastPage = data.pages[data.pages.length - 1]
    const lastPageParam = data.pageParams[data.pageParams.length - 1]
    this.setState({
      data,
      dataUpdatedAt: Date.now(),
      hasNextPage:
        lastPage !== undefined && lastPageParam !== undefined
          ? this.hasMore(lastPage, data.pages, lastPageParam, data.pageParams)
          : false,
    })
  }

  mount() {
    this.refCount++
    if (this.refCount === 1) {
      this.options.onSubscribe?.()
      this.fetch().catch((err) => {
        if (isAbortError(err)) return
        console.error(`[InfiniteQueryObserver] fetch error for ${this.keyHash}:`, err)
      })
    }
  }

  unmount() {
    this.refCount = Math.max(0, this.refCount - 1)
    if (this.refCount === 0) {
      this.options.onUnsubscribe?.()
      this.onUnsubscribe?.()
    }
  }

  destroy() {
    this.listeners.clear()
    this.abortController?.abort()
  }
}
