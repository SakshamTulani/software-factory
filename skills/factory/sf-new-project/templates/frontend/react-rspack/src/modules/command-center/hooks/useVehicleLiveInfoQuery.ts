import { useQuerySelector, useStores } from "@/bindings/react"
import type { LiveInfo } from "@/data"

/** Data hook: one vehicle's live info. Re-renders only when that vehicle changes. */
export function useVehicleLiveInfoQuery(fleetId: string, vehicleId: string): LiveInfo | undefined {
  const { vehicles } = useStores()
  return useQuerySelector(vehicles.getLiveInfo(fleetId), (all) => all?.[vehicleId])
}
