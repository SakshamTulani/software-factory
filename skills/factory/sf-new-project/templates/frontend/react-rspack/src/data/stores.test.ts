import { describe, expect, it } from "@rstest/core"
import { waitFor } from "@testing-library/react"
import { HttpResponse, http } from "msw"

import { httpClient } from "@/shared/api"
import { createFakeRealtimeConnection } from "@/shared/realtime/testing"
import { apiUrl, server } from "@/test/server"

import { buildApiHistoryItem } from "./commands/testing"
import { createStores } from "./stores"
import { buildApiVehicleDetails } from "./vehicles/testing"

describe("stores talking through events", () => {
  it("sendCommand refreshes its own history and, through command/sent, the vehicle's details", async () => {
    let historyLoads = 0
    let detailLoads = 0
    server.use(
      http.post(apiUrl("/commands/getcommandupdatesbyvehicle"), () => {
        historyLoads++
        return HttpResponse.json([buildApiHistoryItem()])
      }),
      http.post(apiUrl("/vehicles/details"), () => {
        detailLoads++
        return HttpResponse.json(buildApiVehicleDetails())
      }),
      http.post(apiUrl("/commands/sendcommandtovehicle"), () => HttpResponse.json({}))
    )
    const stores = createStores({ http: httpClient, realtime: createFakeRealtimeConnection() })
    stores.commands.getHistory("f1", "v1").mount()
    stores.vehicles.getVehicle("f1", "v1").mount()
    await waitFor(() => expect(historyLoads + detailLoads).toBe(2))

    await stores.commands.sendCommand({
      fleetId: "f1",
      vehicleId: "v1",
      commandId: 1,
      validTill: null,
    })

    await waitFor(() => expect(historyLoads).toBe(2))
    await waitFor(() => expect(detailLoads).toBe(2))
  })

  it("an event leaves another fleet's vehicle alone", async () => {
    let detailLoads = 0
    server.use(
      http.post(apiUrl("/vehicles/details"), () => {
        detailLoads++
        return HttpResponse.json(buildApiVehicleDetails())
      }),
      http.post(apiUrl("/commands/sendcommandtovehicle"), () => HttpResponse.json({}))
    )
    const stores = createStores({ http: httpClient, realtime: createFakeRealtimeConnection() })
    stores.vehicles.getVehicle("f2", "v1").mount()
    await waitFor(() => expect(detailLoads).toBe(1))

    await stores.commands.sendCommand({
      fleetId: "f1",
      vehicleId: "v1",
      commandId: 1,
      validTill: null,
    })

    expect(detailLoads).toBe(1)
  })
})
