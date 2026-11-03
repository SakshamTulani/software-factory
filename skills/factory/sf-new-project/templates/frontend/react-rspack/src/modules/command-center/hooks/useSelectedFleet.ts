import { useAppState, useValue } from "@/bindings/react"

/** App-state hook: the selected fleet, and a way to change it. */
export function useSelectedFleet() {
  const { selectedFleetId } = useAppState()
  const fleetId = useValue(selectedFleetId)
  return [fleetId, (id: string) => selectedFleetId.set(id)] as const
}
