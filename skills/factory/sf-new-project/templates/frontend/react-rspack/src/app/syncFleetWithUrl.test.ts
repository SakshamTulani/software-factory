import { afterEach, describe, expect, it } from "@rstest/core"

import { createAppState } from "@/state"

import { syncFleetWithUrl } from "./syncFleetWithUrl"

describe("syncFleetWithUrl", () => {
  afterEach(() => window.history.replaceState(null, "", "/"))

  it("selects the fleet named in the URL", () => {
    window.history.replaceState(null, "", "/command-center?fleet=f2")
    const state = createAppState()

    syncFleetWithUrl(state)

    expect(state.selectedFleetId.get()).toBe("f2")
  })

  it("writes the selected fleet into the URL", () => {
    const state = createAppState()
    syncFleetWithUrl(state)

    state.selectedFleetId.set("f3")

    expect(new URLSearchParams(window.location.search).get("fleet")).toBe("f3")
  })
})
