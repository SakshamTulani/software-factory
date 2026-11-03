import { describe, expect, it } from "@rstest/core"

import { buildApiVehicleLive } from "./testing"
import { mergeLiveInfo, toLiveInfoDelta, toLiveInfoMap } from "./vehicleMappers"

const bytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value))

describe("vehicleMappers", () => {
  it("reads immobilization from the CAN data, and null when it is missing", () => {
    const map = toLiveInfoMap([
      buildApiVehicleLive({
        vehicleid: "v1",
        parsedcandata: { immobilization_status: { pidvalue: 1 } },
      }),
      buildApiVehicleLive({ vehicleid: "v2", parsedcandata: null }),
    ])

    expect(map.v1?.immobilized).toBe(true)
    expect(map.v2?.immobilized).toBeNull()
  })

  it("keeps only the fields a socket message carries", () => {
    expect(toLiveInfoDelta(bytes({ utctime: 5000 }))).toEqual({ updatedAt: new Date(5000) })
  })

  it("ignores a socket message that isn't JSON", () => {
    expect(toLiveInfoDelta(new TextEncoder().encode("not json"))).toBeNull()
  })

  it("keeps the object of a vehicle that got no delta", () => {
    const prev = toLiveInfoMap([
      buildApiVehicleLive({ vehicleid: "v1" }),
      buildApiVehicleLive({ vehicleid: "v2" }),
    ])

    const next = mergeLiveInfo(prev, new Map([["v1", { immobilized: true }]]))

    expect(next.v1?.immobilized).toBe(true)
    expect(next.v2).toBe(prev.v2)
  })

  it("returns the same map for a delta about a vehicle outside the fleet", () => {
    const prev = toLiveInfoMap([buildApiVehicleLive({ vehicleid: "v1" })])

    expect(mergeLiveInfo(prev, new Map([["v9", { immobilized: true }]]))).toBe(prev)
  })
})
