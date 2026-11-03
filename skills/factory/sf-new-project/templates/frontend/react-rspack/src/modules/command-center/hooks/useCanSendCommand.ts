import { canSendCommand } from "../model"
import { useVehicleLiveInfoQuery } from "./useVehicleLiveInfoQuery"

/** Business hook: applies the rule; the rule itself lives in model.ts. */
export function useCanSendCommand(fleetId: string, vehicleId: string): boolean {
  const live = useVehicleLiveInfoQuery(fleetId, vehicleId)
  return canSendCommand(live, Date.now())
}
