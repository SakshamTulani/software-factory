import type { HttpClient } from "@/shared/api"
import type { RealtimeConnection } from "@/shared/realtime"

import { CommandStore } from "./commands"
import { DataEvents } from "./events"
import { VehicleStore } from "./vehicles"

export type DataDeps = {
  http: HttpClient
  realtime: RealtimeConnection
  /** How long socket deltas are buffered. Tests pass a small value. */
  flushMs?: number
}

/**
 * Builds every store once, around one event bus. src/app/App.tsx calls it with
 * the real http client and socket; src/test/render.tsx with the fake socket.
 * A store that reads another store's data receives it here, one direction only.
 */
export function createStores(deps: DataDeps) {
  const events = new DataEvents()
  return {
    commands: new CommandStore({ http: deps.http, events }),
    vehicles: new VehicleStore({ ...deps, events }),
  }
}

export type Stores = ReturnType<typeof createStores>

/** On sign-out: drop every cached query. */
export function clearStores(stores: Stores) {
  for (const store of Object.values(stores)) store.clearCache()
}
