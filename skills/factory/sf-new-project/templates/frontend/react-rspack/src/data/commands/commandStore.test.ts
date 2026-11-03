import { describe, expect, it } from "@rstest/core"
import { HttpResponse, http } from "msw"

import { httpClient } from "@/shared/api"
import { createFakeRealtimeConnection } from "@/shared/realtime/testing"
import { apiUrl, server } from "@/test/server"

import { createStores } from "../stores"
import { buildApiCommand } from "./testing"

const stores = () => createStores({ http: httpClient, realtime: createFakeRealtimeConnection() })

describe("CommandStore", () => {
  it("maps the vehicle's commands and serves the second read from the cache", async () => {
    let loads = 0
    server.use(
      http.post(apiUrl("/commands/listcommandsbyvehicle"), () => {
        loads++
        return HttpResponse.json([buildApiCommand({ cmdid: 7, cmdname: "Unlock" })])
      })
    )
    const { commands } = stores()

    const first = await commands.getCommands("f1", "v1").fetch()
    await commands.getCommands("f1", "v1").fetch()

    expect(first).toEqual([{ id: 7, name: "Unlock", needsConfirmation: true }])
    expect(loads).toBe(1)
  })

  it("rejects a command with no vehicle before calling the server", async () => {
    const { commands } = stores()

    await expect(
      commands.sendCommand({ fleetId: "f1", vehicleId: "", commandId: 1, validTill: null })
    ).rejects.toThrow("Choose a vehicle.")
  })
})
