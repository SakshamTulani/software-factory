import type { FetchOptions, QueryKey, QueryOptions, QueryState } from "./types"

export class QueryObserver<TData = unknown> {
  private state: QueryState<TData>
  private listeners: Set<() => void>
  private fetcher: (params: { signal: AbortSignal }) => Promise<TData>
  private options: QueryOptions
  private fetchPromise: Promise<TData> | null = null
  private abortController: AbortController | null = null
  private onUnsubscribe?: () => void

  public queryKey: QueryKey
  public keyHash: string
  public refCount = 0

  constructor(
    queryKey: QueryKey,
    keyHash: string,
    fetcher: (params: { signal: AbortSignal }) => Promise<TData>,
    options: QueryOptions = {},
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
      error: null,
      dataUpdatedAt: 0,
    }
  }

  getSnapshot(): QueryState<TData> {
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

  private setState(partial: Partial<QueryState<TData>>) {
    this.state = { ...this.state, ...partial }
    this.notify()
  }

  async fetch(fetchOpts?: FetchOptions): Promise<TData> {
    const isStale = this.options.ttl
      ? Date.now() - this.state.dataUpdatedAt > this.options.ttl
      : true

    if (!fetchOpts?.force && !isStale && this.state.data !== undefined) {
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
      error: null,
    })

    const currentController = new AbortController()
    this.abortController = currentController

    this.fetchPromise = this.fetcher({ signal: currentController.signal })
      .then((data) => {
        this.setState({ data, isLoading: false, dataUpdatedAt: Date.now() })
        return data
      })
      .catch((error) => {
        // Ignore abort errors caused by intentional cancellation (axios rejects with CanceledError)
        if (
          currentController.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return Promise.reject(error)
        }
        this.setState({
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
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

  /**
   * Manually inject data into the cache without network request.
   * Useful for Websocket incremental updates and Optimistic Updates.
   */
  setData(data: TData) {
    this.setState({ data, dataUpdatedAt: Date.now() })
  }

  mount() {
    this.refCount++
    if (this.refCount === 1) {
      // First component mounted
      this.options.onSubscribe?.()

      // Fetch if stale
      this.fetch().catch((err) => {
        console.error(`[QueryObserver] fetch error for ${this.keyHash}:`, err)
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
