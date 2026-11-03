import { describe, expect, it, rs } from "@rstest/core"
import { waitFor } from "@testing-library/react"

import { QueryCache } from "./query-cache"

describe("QueryCache", () => {
  it("keeps a query that was mounted again before its GC timer fired", async () => {
    rs.useFakeTimers()
    const cache = new QueryCache()
    const observer = cache.getQuery(["vehicles"], async () => ["v1"], { gcTime: 1000 })
    observer.mount()
    await observer.fetch()

    observer.unmount()
    observer.mount()
    rs.advanceTimersByTime(1000)

    expect(cache.getQuery(["vehicles"], async () => ["other"])).toBe(observer)
    expect(cache.getQueryData(["vehicles"])).toEqual(["v1"])
    rs.useRealTimers()
  })

  it("removes a query nobody watches once its GC time passes", async () => {
    rs.useFakeTimers()
    const cache = new QueryCache()
    const observer = cache.getQuery(["vehicles"], async () => ["v1"], { gcTime: 1000 })
    observer.mount()
    await observer.fetch()

    observer.unmount()
    rs.advanceTimersByTime(1000)

    expect(cache.getQueryData(["vehicles"])).toBeUndefined()
    rs.useRealTimers()
  })

  it("refetches a watched query when a key prefix is invalidated", async () => {
    const cache = new QueryCache()
    let calls = 0
    const observer = cache.getQuery(["history", "f1", "v1"], async () => ++calls)
    observer.mount()
    await observer.fetch()

    cache.invalidateQueries(["history", "f1"])

    await waitFor(() => expect(observer.getSnapshot().data).toBe(2))
  })
})
