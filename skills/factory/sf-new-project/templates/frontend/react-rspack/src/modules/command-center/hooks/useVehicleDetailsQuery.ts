import { useQuery, useStores } from "@/bindings/react"

/** Data hook: registration and last command time. Refetches when a command is sent. */
export function useVehicleDetailsQuery(fleetId: string, vehicleId: string) {
  return useQuery(useStores().vehicles.getVehicle(fleetId, vehicleId))
}
