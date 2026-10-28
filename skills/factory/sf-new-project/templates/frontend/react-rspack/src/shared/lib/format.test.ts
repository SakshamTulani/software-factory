import { describe, expect, it } from "@rstest/core"

import {
  formatDate,
  formatDateInput,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  formatRelative,
  MISSING,
  parseDateInput,
  toTime,
} from "./format"

const at = new Date(2026, 9, 29, 14, 5)

describe("instants", () => {
  it("format the same whatever form they arrive in", () => {
    for (const v of [at, at.getTime()]) {
      expect(formatDate(v)).toBe("2026-10-29")
      expect(formatDateTime(v)).toBe("2026-10-29 14:05")
    }
  })

  it("accept ISO strings but not ambiguous ones", () => {
    expect(toTime("2026-10-29T14:05:00Z")).toBe(Date.parse("2026-10-29T14:05:00Z"))
    expect(toTime("29/10/2026")).toBeNull()
    expect(formatDate("29/10/2026")).toBe(MISSING)
  })

  it("show missing values as a dash", () => {
    expect(formatDateTime(null)).toBe(MISSING)
    expect(formatDate(undefined)).toBe(MISSING)
  })

  it("show recency in words, then the date", () => {
    const now = at.getTime()
    expect(formatRelative(now - 20_000, now)).toBe("just now")
    expect(formatRelative(now - 5 * 60_000, now)).toBe("5 min ago")
    expect(formatRelative(now - 3 * 3_600_000, now)).toBe("3 h ago")
    expect(formatRelative(new Date(2026, 9, 28, 9, 0), now)).toBe("Yesterday")
    expect(formatRelative(new Date(2026, 9, 20), now)).toBe("2026-10-20")
  })
})

describe("durations", () => {
  it("show the largest two units", () => {
    expect(formatDuration(45_000)).toBe("45s")
    expect(formatDuration(9 * 60_000)).toBe("9m")
    expect(formatDuration(90 * 60_000)).toBe("1h 30m")
    expect(formatDuration(2 * 3_600_000)).toBe("2h")
    expect(formatDuration((2 * 24 + 4) * 3_600_000)).toBe("2d 4h")
    expect(formatDuration(null)).toBe(MISSING)
  })
})

describe("numbers", () => {
  it("print a real zero and a dash for missing", () => {
    expect(formatNumber(0)).toBe("0")
    expect(formatNumber(null)).toBe(MISSING)
  })

  it("use fixed decimals and the unit", () => {
    expect(formatNumber(42.456, { decimals: 1, unit: "km/h" })).toMatch(/^42[.,]5 km\/h$/)
    expect(formatPercent(12.345)).toMatch(/^12[.,]3%$/)
  })
})

describe("date inputs", () => {
  it("round-trip the ISO date and reject invalid text", () => {
    expect(formatDateInput(at)).toBe("2026-10-29")
    expect(parseDateInput("2026-10-29")?.getDate()).toBe(29)
    expect(parseDateInput("29-10-2026")).toBeNull()
    expect(parseDateInput("")).toBeNull()
  })
})
