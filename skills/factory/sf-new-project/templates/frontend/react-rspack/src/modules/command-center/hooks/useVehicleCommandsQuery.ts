import { useQuery, useStores } from "@/bindings/react"

/** Data hook: the commands this vehicle supports. */
export function useVehicleCommandsQuery(fleetId: string, vehicleId: string) {
  return useQuery(useStores().commands.getCommands(fleetId, vehicleId))
}
