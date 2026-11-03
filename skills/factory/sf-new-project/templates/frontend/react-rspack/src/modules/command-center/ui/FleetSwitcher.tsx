import { useState } from "react"

import { Button } from "@/shared/ui/button"

import { useFleetsQuery } from "../hooks/useFleetsQuery"
import { useSelectedFleet } from "../hooks/useSelectedFleet"

export function FleetSwitcher() {
  const fleets = useFleetsQuery()
  const [fleetId, selectFleet] = useSelectedFleet() // app state: every screen sees it
  const [open, setOpen] = useState(false) // view state: only this dropdown cares

  const current = fleets.data?.find((f) => f.id === fleetId)

  return (
    <div className="relative">
      <Button variant="outline" aria-expanded={open} onClick={() => setOpen(!open)}>
        {current?.name ?? "Choose a fleet"}
      </Button>
      {open && (
        <ul className="absolute z-10 mt-1 flex flex-col rounded-md border bg-background p-1">
          {fleets.data?.map((fleet) => (
            <li key={fleet.id}>
              <Button
                variant="ghost"
                aria-pressed={fleet.id === fleetId}
                onClick={() => {
                  selectFleet(fleet.id)
                  setOpen(false)
                }}
              >
                {fleet.name}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
