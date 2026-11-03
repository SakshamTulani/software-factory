import type { Fleet, LiveInfo, LiveInfoMap, VehicleDetails } from "./types"

// Wire types: exactly what the server sends.
export type ApiFleet = { fleetid: string; fleetname: string }
export type ApiVehicleDetails = { vehicleid: string; regno: string; lastcmdat: number | null }
type ApiPid = { pidvalue?: number }
type ApiCanData = { immobilization_status?: ApiPid; vehicle_mode_status?: ApiPid }
export type ApiVehicleLive = {
  vehicleid: string
  utctime: number | null
  parsedcandata: ApiCanData | null
}
/** One socket message on combinfo/<vehicleId>. Any field may be missing. */
export type ApiLiveMessage = { utctime?: number; parsedcandata?: ApiCanData }

export const toFleet = (d: ApiFleet): Fleet => ({ id: d.fleetid, name: d.fleetname })

export const toVehicleDetails = (d: ApiVehicleDetails): VehicleDetails => ({
  id: d.vehicleid,
  regNo: d.regno,
  lastCommandAt: d.lastcmdat == null ? null : new Date(d.lastcmdat),
})

export const toLiveInfoMap = (list: ApiVehicleLive[]): LiveInfoMap =>
  Object.fromEntries(
    list.map((d) => [
      d.vehicleid,
      {
        vehicleId: d.vehicleid,
        immobilized: flag(d.parsedcandata?.immobilization_status),
        mode: pid(d.parsedcandata?.vehicle_mode_status),
        updatedAt: d.utctime == null ? null : new Date(d.utctime),
      },
    ])
  )

const decoder = new TextDecoder()

/** Socket bytes → the fields this message carries. null if it carries nothing we use. */
export function toLiveInfoDelta(payload: Uint8Array): Partial<LiveInfo> | null {
  let raw: unknown
  try {
    raw = JSON.parse(decoder.decode(payload))
  } catch {
    return null
  }
  const items = (Array.isArray(raw) ? raw : [raw]) as ApiLiveMessage[]
  const delta: Partial<LiveInfo> = {}
  for (const item of items) {
    if (!item || typeof item !== "object") continue
    const immobilized = flag(item.parsedcandata?.immobilization_status)
    const mode = pid(item.parsedcandata?.vehicle_mode_status)
    if (immobilized !== null) delta.immobilized = immobilized
    if (mode !== null) delta.mode = mode
    if (typeof item.utctime === "number") delta.updatedAt = new Date(item.utctime)
  }
  return Object.keys(delta).length > 0 ? delta : null
}

/**
 * Applies buffered deltas. Vehicles without a delta keep their object, so a
 * component showing one vehicle re-renders only when that vehicle changes.
 * Deltas for vehicles not in the fleet are ignored. Returns prev if nothing changed.
 */
export function mergeLiveInfo(
  prev: LiveInfoMap,
  deltas: Map<string, Partial<LiveInfo>>
): LiveInfoMap {
  let next: LiveInfoMap | null = null
  for (const [vehicleId, delta] of deltas) {
    const current = prev[vehicleId]
    if (!current) continue
    next ??= { ...prev }
    next[vehicleId] = { ...current, ...delta }
  }
  return next ?? prev
}

const pid = (field: ApiPid | undefined): number | null =>
  typeof field?.pidvalue === "number" ? field.pidvalue : null

const flag = (field: ApiPid | undefined): boolean | null => {
  const value = pid(field)
  return value === null ? null : value === 1
}
