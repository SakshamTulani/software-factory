import { Link } from "react-router-dom"

import { useFleetLiveInfoQuery } from "../hooks/useFleetLiveInfoQuery"

export function VehicleList({ fleetId }: { fleetId: string }) {
  const live = useFleetLiveInfoQuery(fleetId)

  if (live.isPending) return <p className="text-muted-foreground">Loading vehicles…</p>
  if (live.error) return <p role="alert">Couldn't load this fleet's vehicles.</p>

  const vehicles = Object.values(live.data ?? {})
  if (vehicles.length === 0)
    return <p className="text-muted-foreground">This fleet has no vehicles.</p>

  return (
    <ul aria-label="Vehicles" className="flex flex-col gap-1">
      {vehicles.map((v) => (
        <li key={v.vehicleId}>
          <Link to={`/command-center/${v.vehicleId}`}>{v.vehicleId}</Link>
        </li>
      ))}
    </ul>
  )
}
