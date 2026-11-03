export type Fleet = {
  id: string
  name: string
}

export type VehicleDetails = {
  id: string
  regNo: string
  lastCommandAt: Date | null
}

export type LiveInfo = {
  vehicleId: string
  immobilized: boolean | null
  mode: number | null
  updatedAt: Date | null
}

/** Live info for a fleet, keyed by vehicleId. */
export type LiveInfoMap = Record<string, LiveInfo>
