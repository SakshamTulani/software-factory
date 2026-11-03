import { State } from "./State"

/**
 * App-wide choices that decide which data to show. They are not server data,
 * so they live outside src/data/: stores take these values as arguments.
 */
export function createAppState(initial: { fleetId?: string | null } = {}) {
  return {
    selectedFleetId: new State<string | null>(initial.fleetId ?? null),
  }
}

export type AppState = ReturnType<typeof createAppState>
