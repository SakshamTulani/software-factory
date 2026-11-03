import { formatRelative } from "@/shared/lib/format"

import { useVehicleLiveInfoQuery } from "../hooks/useVehicleLiveInfoQuery"

type Props = { fleetId: string; vehicleId: string }

export function VehicleStatusBadge({ fleetId, vehicleId }: Props) {
  const live = useVehicleLiveInfoQuery(fleetId, vehicleId)
  if (!live) return <span className="text-muted-foreground">No live data</span>

  return (
    <span className={live.immobilized ? "text-destructive" : "text-foreground"}>
      {live.immobilized ? "Immobilized" : "Mobile"}
      {live.updatedAt && <> · {formatRelative(live.updatedAt)}</>}
    </span>
  )
}
