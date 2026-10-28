import { describe, expect, it } from "@rstest/core"

import { compareValues } from "./comparators"

const sortWith = (values: unknown[], descending = false) =>
  [...values].sort((a, b) => {
    const c = compareValues(a, b, undefined, undefined, descending)
    return descending ? -c : c
  })

describe("compareValues", () => {
  it("sorts numbers and numeric strings numerically", () => {
    expect(sortWith([10, "9", 2.5, "100"])).toEqual([2.5, "9", 10, "100"])
  })

  it("sorts text naturally, ignoring case", () => {
    expect(sortWith(["truck 10", "Truck 2", "bus"])).toEqual(["bus", "Truck 2", "truck 10"])
  })

  // Array#sort moves undefined to the end without calling the comparator, so these use null.
  it("keeps missing values at the bottom in both directions", () => {
    expect(sortWith([3, null, "—", 1])).toEqual([1, 3, null, "—"])
    expect(sortWith([3, null, 1, "NA"], true)).toEqual([3, 1, null, "NA"])
  })

  it("sorts dates by time", () => {
    const d1 = new Date("2026-01-02")
    const d2 = new Date("2026-01-01")
    expect(sortWith([d1, d2])).toEqual([d2, d1])
  })
})
