import { useQuery, useStores } from "@/bindings/react"

/** Data hook: the fleets the user can choose from. */
export function useFleetsQuery() {
  return useQuery(useStores().vehicles.getFleets())
}
