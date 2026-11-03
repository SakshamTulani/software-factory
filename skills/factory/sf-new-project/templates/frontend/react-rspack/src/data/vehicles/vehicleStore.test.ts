import { describe, expect, it } from "@rstest/core"
import { waitFor } from "@testing-library/react"
import { HttpResponse, http } from "msw"

import { httpClient } from "@/shared/api"
import { createFakeRealtimeConnection } from "@/shared/realtime/testing"
import { apiUrl, server } from "@/test/server"

import { createStores } from "../stores"
import { buildApiVehicleLive } from "./testing"

function setup() {
  let snapshots = 0
  server.use(
    http.post(apiUrl("/vehicles/liveinfo"), () => {
      snapshots++
      return HttpResponse.json([
        buildApiVehicleLive({ vehicleid: "v1" }),
        buildApiVehicleLive({ vehicleid: "v2" }),
      ])
    })
  )
  const realtime = createFakeRealtimeConnection()
  const { vehicles } = createStores({ http: httpClient, realtime, flushMs: 20 })
  return { vehicles, realtime, snapshots: () => snapshots }
}

describe("VehicleStore live info", () => {
  it("loads the fleet's snapshot, then opens one topic per vehicle", async () => {
    const { vehicles, realtime } = setup()
    const live = vehicles.getLiveInfo("f1")

    live.mount()

    await waitFor(() =>
      expect(realtime.subscriptions()).toEqual(["pubsub/combinfo/v1", "pubsub/combinfo/v2"])
    )
    expect(live.getSnapshot().data?.v1?.immobilized).toBe(false)
  })

  it("applies a burst of socket messages in one update after the flush", async () => {
    const { vehicles, realtime } = setup()
    const live = vehicles.getLiveInfo("f1")
    live.mount()
    await waitFor(() => expect(realtime.subscriptions()).toHaveLength(2))
    const before = live.getSnapshot().data
    let updates = 0
    live.subscribe(() => updates++)

    realtime.emit("pubsub", "combinfo/v1", {
      parsedcandata: { immobilization_status: { pidvalue: 1 } },
    })
    realtime.emit("pubsub", "combinfo/v1", { utctime: 5000 })

    expect(live.getSnapshot().data?.v1?.immobilized).toBe(false)
    await waitFor(() => expect(live.getSnapshot().data?.v1?.immobilized).toBe(true))
    expect(updates).toBe(1)
    expect(live.getSnapshot().data?.v1?.updatedAt).toEqual(new Date(5000))
    expect(live.getSnapshot().data?.v2).toBe(before?.v2)
  })

  it("closes every topic when the last watcher leaves", async () => {
    const { vehicles, realtime } = setup()
    const live = vehicles.getLiveInfo("f1")
    live.mount()
    await waitFor(() => expect(realtime.subscriptions()).toHaveLength(2))

    live.unmount()

    expect(realtime.subscriptions()).toEqual([])
  })

  it("takes a fresh snapshot when the socket reconnects", async () => {
    const { vehicles, realtime, snapshots } = setup()
    vehicles.getLiveInfo("f1").mount()
    await waitFor(() => expect(realtime.subscriptions()).toHaveLength(2))

    realtime.setStatus("inactive")
    realtime.setStatus("active")

    await waitFor(() => expect(snapshots()).toBe(2))
  })

  it("refetches cached live info when it is watched again, because its topics were closed", async () => {
    const { vehicles, realtime, snapshots } = setup()
    const live = vehicles.getLiveInfo("f1")
    live.mount()
    await waitFor(() => expect(realtime.subscriptions()).toHaveLength(2))
    live.unmount()

    live.mount()

    await waitFor(() => expect(snapshots()).toBe(2))
    await waitFor(() => expect(realtime.subscriptions()).toHaveLength(2))
  })
})
