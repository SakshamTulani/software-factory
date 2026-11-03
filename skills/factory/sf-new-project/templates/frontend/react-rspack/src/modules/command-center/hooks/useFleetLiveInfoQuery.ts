import { useQuery, useStores } from "@/bindings/react"

/** Data hook: live info for the whole fleet. Re-renders on every socket flush. */
export function useFleetLiveInfoQuery(fleetId: string) {
  return useQuery(useStores().vehicles.getLiveInfo(fleetId))
}
