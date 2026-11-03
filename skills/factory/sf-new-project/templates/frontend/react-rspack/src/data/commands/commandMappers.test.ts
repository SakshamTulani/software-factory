import { describe, expect, it } from "@rstest/core"

import { toApiSendCommand, toHistoryItem } from "./commandMappers"
import { buildApiHistoryItem } from "./testing"

describe("commandMappers", () => {
  it("turns the numeric status code into a status name", () => {
    expect(toHistoryItem(buildApiHistoryItem({ status: 1 })).status).toBe("delivered")
  })

  it("treats an unknown status code as failed", () => {
    expect(toHistoryItem(buildApiHistoryItem({ status: 99 })).status).toBe("failed")
  })

  it("sends -1 as validtill when the command has no expiry", () => {
    const body = toApiSendCommand({ fleetId: "f1", vehicleId: "v1", commandId: 1, validTill: null })

    expect(body.validtill).toBe(-1)
  })
})
