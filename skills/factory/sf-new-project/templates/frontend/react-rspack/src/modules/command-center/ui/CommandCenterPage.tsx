import { useParams } from "react-router-dom"

import { useSelectedFleet } from "../hooks/useSelectedFleet"
import { CommandPanel } from "./CommandPanel"
import { FleetSwitcher } from "./FleetSwitcher"
import { VehicleList } from "./VehicleList"

/** Reads the selected fleet once and passes it down as a prop. */
export function CommandCenterPage() {
  const [fleetId] = useSelectedFleet()
  const { vehicleId } = useParams()

  return (
    <div className="flex flex-col gap-6">
      <FleetSwitcher />
      {fleetId ? (
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <VehicleList fleetId={fleetId} />
          {vehicleId ? (
            <CommandPanel fleetId={fleetId} vehicleId={vehicleId} />
          ) : (
            <p className="text-muted-foreground">Choose a vehicle.</p>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Choose a fleet to see its vehicles.</p>
      )}
    </div>
  )
}
