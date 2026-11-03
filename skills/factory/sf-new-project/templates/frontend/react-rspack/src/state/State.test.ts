import { describe, expect, it } from "@rstest/core"

import { State } from "./State"

describe("State", () => {
  it("notifies listeners when the value changes", () => {
    const state = new State<string | null>(null)
    const seen: (string | null)[] = []
    state.subscribe(() => seen.push(state.get()))

    state.set("f1")

    expect(seen).toEqual(["f1"])
  })

  it("doesn't notify when the same value is set again", () => {
    const state = new State("f1")
    let calls = 0
    state.subscribe(() => calls++)

    state.set("f1")

    expect(calls).toBe(0)
  })
})
