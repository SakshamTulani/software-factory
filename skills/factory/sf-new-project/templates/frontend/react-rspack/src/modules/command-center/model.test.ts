import { describe, expect, it } from "@rstest/core"

import type { LiveInfo } from "@/data"

import { canSendCommand, STALE_AFTER_MS } from "./model"

const NOW = Date.parse("2026-11-03T10:00:00Z")
const live = (updatedAt: Date | null): LiveInfo => ({
  vehicleId: "v1",
  immobilized: false,
  mode: null,
  updatedAt,
})

describe("canSendCommand", () => {
  it("allows a vehicle that reported within the last 10 minutes", () => {
    expect(canSendCommand(live(new Date(NOW - STALE_AFTER_MS + 1)), NOW)).toBe(true)
  })

  it("blocks a vehicle whose last report is 10 minutes old", () => {
    expect(canSendCommand(live(new Date(NOW - STALE_AFTER_MS)), NOW)).toBe(false)
  })

  it("blocks a vehicle that never reported", () => {
    expect(canSendCommand(live(null), NOW)).toBe(false)
    expect(canSendCommand(undefined, NOW)).toBe(false)
  })
})
