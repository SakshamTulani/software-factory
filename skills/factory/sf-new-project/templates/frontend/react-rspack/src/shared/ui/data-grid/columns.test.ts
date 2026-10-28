import { describe, expect, it } from "@rstest/core"

import { formatDuration, toTime } from "@/shared/lib/format"

import { columnKindDefaults, orderedComparator } from "./columns"

type Compare = (a: unknown, b: unknown, na?: unknown, nb?: unknown, desc?: boolean) => number
const comparatorOf = (kind: Parameters<typeof columnKindDefaults>[0], opts = {}) =>
  columnKindDefaults(kind, opts).comparator as Compare
const sortWith = (cmp: Compare, values: unknown[]) => [...values].sort((a, b) => cmp(a, b))

describe("date and datetime columns", () => {
  it("sort chronologically, whatever form the date arrives in", () => {
    const oct3 = new Date("2026-10-03T08:00:00Z")
    const sep30 = "2026-09-30T23:00:00Z"
    const oct1 = Date.parse("2026-10-01T00:00:00Z")
    expect(sortWith(comparatorOf("datetime"), [oct3, sep30, oct1])).toEqual([sep30, oct1, oct3])
  })

  it("would sort wrongly as text, which is why rows must not hold formatted strings", () => {
    const shown = ["03 Oct 2026", "30 Sep 2026", "01 Oct 2026"]
    expect([...shown].sort()).toEqual(["01 Oct 2026", "03 Oct 2026", "30 Sep 2026"])
    expect(toTime("30 Sep 2026")).toBeNull()
  })

  it("filter by whole day: any time on the chosen day matches", () => {
    const { filterParams } = columnKindDefaults("datetime") as {
      filterParams: { comparator: (day: Date, cell: unknown) => number }
    }
    const day = new Date(2026, 9, 29)
    expect(filterParams.comparator(day, new Date(2026, 9, 29, 18, 30).getTime())).toBe(0)
    expect(filterParams.comparator(day, new Date(2026, 9, 28, 23, 59))).toBeLessThan(0)
    expect(filterParams.comparator(day, new Date(2026, 9, 30, 0, 1))).toBeGreaterThan(0)
  })
})

describe("duration columns", () => {
  it("sort by milliseconds, not by the text shown", () => {
    const ninety = 90 * 60_000
    const nine = 9 * 60_000
    expect(formatDuration(ninety)).toBe("1h 30m")
    expect(formatDuration(nine)).toBe("9m")
    expect(sortWith(comparatorOf("duration"), [ninety, nine])).toEqual([nine, ninety])
  })
})

describe("number columns", () => {
  it("sort numerically even when the API sends numeric strings", () => {
    expect(sortWith(comparatorOf("number"), ["10", "9", 100])).toEqual(["9", "10", 100])
  })
})

describe("enum columns", () => {
  it("sort by their meaningful order, unknown values after, missing last", () => {
    const bySeverity = orderedComparator(["critical", "high", "medium", "low"])
    expect(sortWith(bySeverity, ["low", null, "critical", "other", "medium"])).toEqual([
      "critical",
      "medium",
      "low",
      "other",
      null,
    ])
  })
})
