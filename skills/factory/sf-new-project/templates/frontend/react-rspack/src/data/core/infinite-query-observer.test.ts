import assert from "node:assert/strict"
import { test } from "@rstest/core"

import { InfiniteQueryObserver } from "./infinite-query-observer"
import { QueryCache } from "./query-cache"

type Page = { items: string[]; next: number | null }

function delayedPage(
  page: Page,
  ms = 0
): (params: { pageParam: number | null; signal: AbortSignal }) => Promise<Page> {
  return ({ signal }) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(page), ms)
      signal.addEventListener("abort", () => {
        clearTimeout(timer)
        reject(new DOMException("Aborted", "AbortError"))
      })
    })
}

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("missing page")
  return value
}

function pagesOf(n: number, size = 2): Page[] {
  const pages: Page[] = []
  for (let start = 0; start < n; start += size) {
    const items = Array.from({ length: Math.min(size, n - start) }, (_, i) => String(start + i))
    const next = start + size < n ? start + size : null
    pages.push({ items, next })
  }
  return pages
}

test("first fetch stores the first page and whether another page exists", async () => {
  const first = required(pagesOf(4)[0])
  const observer = new InfiniteQueryObserver<Page, number | null>(
    ["history"],
    '["history"]',
    delayedPage(first),
    {
      initialPageParam: null,
      getNextPageParam: (page) => page.next,
    }
  )

  await observer.fetch()
  const state = observer.getSnapshot()

  assert.deepEqual(state.data?.pages, [first])
  assert.equal(state.hasNextPage, true)
  assert.equal(state.isLoading, false)
  assert.equal(state.isFetchingNextPage, false)
})

test("fetchNextPage appends the next page and stops when next is null", async () => {
  const catalog = pagesOf(4)
  const observer = new InfiniteQueryObserver<Page, number | null>(
    ["history"],
    '["history"]',
    ({ pageParam, signal }) => {
      const page = catalog.find((p) =>
        pageParam == null ? p.next === 2 : p.items[0] === String(pageParam)
      )
      return delayedPage(required(page))({ pageParam, signal })
    },
    {
      initialPageParam: null,
      getNextPageParam: (page) => page.next,
    }
  )

  await observer.fetch()
  await observer.fetchNextPage()
  const state = observer.getSnapshot()

  assert.deepEqual(
    state.data?.pages.flatMap((page) => page.items),
    ["0", "1", "2", "3"]
  )
  assert.equal(state.hasNextPage, false)

  await observer.fetchNextPage()
  assert.equal(observer.getSnapshot().data?.pages.length, 2)
})

test("overlapping fetchNextPage calls share one request", async () => {
  let calls = 0
  const catalog = pagesOf(4)
  const observer = new InfiniteQueryObserver<Page, number | null>(
    ["history"],
    '["history"]',
    ({ pageParam, signal }) => {
      calls++
      const page = catalog.find((p) =>
        pageParam == null ? p.next === 2 : p.items[0] === String(pageParam)
      )
      return delayedPage(required(page), 20)({ pageParam, signal })
    },
    {
      initialPageParam: null,
      getNextPageParam: (page) => page.next,
    }
  )

  await observer.fetch()
  const firstCalls = calls
  await Promise.all([observer.fetchNextPage(), observer.fetchNextPage()])

  assert.equal(calls, firstCalls + 1)
  assert.equal(observer.getSnapshot().data?.pages.length, 2)
})

test("force fetch replaces loaded pages with a fresh first page", async () => {
  const catalog = pagesOf(4)
  const observer = new InfiniteQueryObserver<Page, number | null>(
    ["history"],
    '["history"]',
    ({ pageParam, signal }) => {
      const page = catalog.find((p) =>
        pageParam == null ? p.next === 2 : p.items[0] === String(pageParam)
      )
      return delayedPage(required(page))({ pageParam, signal })
    },
    {
      initialPageParam: null,
      getNextPageParam: (page) => page.next,
    }
  )

  await observer.fetch()
  await observer.fetchNextPage()
  await observer.fetch({ force: true })
  const state = observer.getSnapshot()

  assert.equal(state.data?.pages.length, 1)
  assert.deepEqual(state.data?.pages[0]?.items, ["0", "1"])
  assert.equal(state.hasNextPage, true)
})

test("QueryCache reuses an infinite observer and invalidateQueries refetches it", async () => {
  let calls = 0
  const cache = new QueryCache()
  const make = () =>
    cache.getInfiniteQuery<Page, number | null>(
      ["POST", "/history"],
      ({ signal }) => {
        calls++
        return delayedPage({ items: ["a"], next: null })({
          pageParam: null,
          signal,
        })
      },
      {
        initialPageParam: null,
        getNextPageParam: (page) => page.next,
      }
    )

  const first = make()
  first.mount()
  await first.fetch()
  const afterMount = calls
  assert.equal(make(), first)

  cache.invalidateQueries(["POST", "/history"])
  await new Promise((resolve) => setTimeout(resolve, 20))
  assert.ok(calls > afterMount)
  first.unmount()
  cache.clear()
})
