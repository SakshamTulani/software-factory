/**
 * What stores tell each other after a write. The store that wrote announces
 * what happened; each store that caches affected data invalidates its own
 * queries (frontend-architecture, "Stores talk through events").
 */
export type DataEvent =
  | { type: "command/sent"; fleetId: string; vehicleId: string; commandId: number }
  | { type: "vehicle/renamed"; fleetId: string; vehicleId: string }

type Handler<T extends DataEvent["type"]> = (event: Extract<DataEvent, { type: T }>) => void

export class DataEvents {
  private readonly handlers = new Map<string, Set<(event: DataEvent) => void>>()

  emit(event: DataEvent) {
    for (const handler of this.handlers.get(event.type) ?? []) handler(event)
  }

  on<T extends DataEvent["type"]>(type: T, handler: Handler<T>): () => void {
    const set = this.handlers.get(type) ?? new Set()
    this.handlers.set(type, set)
    const h = handler as (event: DataEvent) => void
    set.add(h)
    return () => {
      set.delete(h)
    }
  }
}
