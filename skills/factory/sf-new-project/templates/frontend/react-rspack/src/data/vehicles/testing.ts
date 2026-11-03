// Test data builders for the vehicles domain. Only tests import this file.
import type { ApiFleet, ApiLiveMessage, ApiVehicleDetails, ApiVehicleLive } from "./vehicleMappers"

export const buildApiFleet = (overrides: Partial<ApiFleet> = {}): ApiFleet => ({
  fleetid: "f1",
  fleetname: "North depot",
  ...overrides,
})

export const buildApiVehicleDetails = (
  overrides: Partial<ApiVehicleDetails> = {}
): ApiVehicleDetails => ({
  vehicleid: "v1",
  regno: "KA01AB1234",
  lastcmdat: null,
  ...overrides,
})

export const buildApiVehicleLive = (overrides: Partial<ApiVehicleLive> = {}): ApiVehicleLive => ({
  vehicleid: "v1",
  utctime: Date.parse("2026-11-03T09:00:00Z"),
  parsedcandata: { immobilization_status: { pidvalue: 0 } },
  ...overrides,
})

export const buildApiLiveMessage = (overrides: Partial<ApiLiveMessage> = {}): ApiLiveMessage => ({
  ...overrides,
})
