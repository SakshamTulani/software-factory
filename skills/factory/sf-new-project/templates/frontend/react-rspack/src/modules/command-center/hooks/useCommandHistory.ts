import { useMemo } from "react"

import { useQuery, useStores } from "@/bindings/react"

import { newestFirst } from "../model"

/** Business hook: the vehicle's command history, ordered by the rule in model.ts. */
export function useCommandHistory(fleetId: string, vehicleId: string) {
  const { data, isPending, error } = useQuery(useStores().commands.getHistory(fleetId, vehicleId))
  const items = useMemo(() => [...(data ?? [])].sort(newestFirst), [data])
  return { items, isPending, error }
}
