import type { HttpClient } from "@/shared/api"
import type { RealtimeConnection } from "@/shared/realtime"

import { BaseCacheStore, type QueryObserver } from "../core"
import type { DataEvents } from "../events"
import type { Fleet, LiveInfo, LiveInfoMap, VehicleDetails } from "./types"
import {
  type ApiFleet,
  type ApiVehicleDetails,
  type ApiVehicleLive,
  mergeLiveInfo,
  toFleet,
  toLiveInfoDelta,
  toLiveInfoMap,
  toVehicleDetails,
} from "./vehicleMappers"

/** Every cache key this store uses. invalidateQueries() takes these, or a prefix of one. */
export const vehicleKeys = {
  fleets: () => ["fleets"] as const,
  vehicle: (fleetId: string, vehicleId: string) => ["vehicles", fleetId, vehicleId] as const,
  liveInfo: (fleetId: string) => ["vehicles", "live", fleetId] as const,
}

/** How long each read stays fresh, in ms. */
const TTL = {
  fleets: 5 * 60_000,
  vehicle: 60_000,
  liveInfo: Number.POSITIVE_INFINITY, // the socket keeps it fresh
}

const LIVE_CHANNEL = "pubsub"
const liveTopic = (vehicleId: string) => `combinfo/${vehicleId}`

type Signal = { signal: AbortSignal }

export type VehicleStoreDeps = {
  http: HttpClient
  realtime: RealtimeConnection
  events: DataEvents
  /** How long socket deltas are buffered before they reach the UI. Default 1000 ms. */
  flushMs?: number
}

export class VehicleStore extends BaseCacheStore {
  private readonly deps: VehicleStoreDeps
  private readonly streams = new Map<string, () => void>() // fleetId → stop

  constructor(deps: VehicleStoreDeps) {
    super()
    this.deps = deps
    // Another store's write changed data this store caches: invalidate our own query.
    deps.events.on("command/sent", (e) =>
      this.invalidateQueries(vehicleKeys.vehicle(e.fleetId, e.vehicleId))
    )
    deps.events.on("vehicle/renamed", (e) =>
      this.invalidateQueries(vehicleKeys.vehicle(e.fleetId, e.vehicleId))
    )
  }

  // ── Queries: cached reads, wire → entity ──

  getFleets(): QueryObserver<Fleet[]> {
    return this.queryCache.getQuery(
      vehicleKeys.fleets(),
      async ({ signal }) => (await this.listFleets({ signal })).map(toFleet),
      { ttl: TTL.fleets }
    )
  }

  getVehicle(fleetId: string, vehicleId: string): QueryObserver<VehicleDetails> {
    return this.queryCache.getQuery(
      vehicleKeys.vehicle(fleetId, vehicleId),
      async ({ signal }) =>
        toVehicleDetails(await this.vehicleDetails(fleetId, vehicleId, { signal })),
      { ttl: TTL.vehicle }
    )
  }

  /**
   * Live info for every vehicle in the fleet: a REST snapshot, then socket
   * deltas. The socket topics are open only while a component watches it.
   */
  getLiveInfo(fleetId: string): QueryObserver<LiveInfoMap> {
    return this.queryCache.getQuery(
      vehicleKeys.liveInfo(fleetId),
      async ({ signal }) => toLiveInfoMap(await this.liveInfoByFleet(fleetId, { signal })),
      {
        ttl: TTL.liveInfo,
        onSubscribe: () => this.streams.set(fleetId, this.streamLiveInfo(fleetId)),
        onUnsubscribe: () => {
          this.streams.get(fleetId)?.()
          this.streams.delete(fleetId)
        },
      }
    )
  }

  // ── Live: runs from the first watcher to the last ──

  private streamLiveInfo(fleetId: string): () => void {
    const query = this.getLiveInfo(fleetId)
    const topics = new Map<string, () => void>() // vehicleId → unsubscribe
    const pending = new Map<string, Partial<LiveInfo>>() // vehicleId → merged delta
    let timer: ReturnType<typeof setTimeout> | null = null
    let active = true
    let lastStatus = this.deps.realtime.status()

    // Flush: apply every buffered delta in one update.
    const flush = () => {
      timer = null
      if (pending.size === 0) return
      const deltas = new Map(pending)
      pending.clear()
      const prev = query.getSnapshot().data ?? {}
      const next = mergeLiveInfo(prev, deltas)
      if (next !== prev) query.setData(next)
    }

    // Message: parse, buffer, schedule a flush. Nothing re-renders yet.
    const onMessage = (vehicleId: string, payload: Uint8Array) => {
      const delta = toLiveInfoDelta(payload)
      if (!delta) return
      pending.set(vehicleId, { ...pending.get(vehicleId), ...delta })
      timer ??= setTimeout(flush, this.deps.flushMs ?? 1000)
    }

    // Topics follow the vehicles in the snapshot.
    const syncTopics = () => {
      if (!active) return
      const wanted = new Set(Object.keys(query.getSnapshot().data ?? {}))
      for (const [vehicleId, unsubscribe] of topics) {
        if (wanted.has(vehicleId)) continue
        unsubscribe()
        topics.delete(vehicleId)
      }
      for (const vehicleId of wanted) {
        if (topics.has(vehicleId)) continue
        const unsubscribe = this.deps.realtime.subscribe(LIVE_CHANNEL, liveTopic(vehicleId), (m) =>
          onMessage(vehicleId, m.payload)
        )
        topics.set(vehicleId, unsubscribe)
      }
    }

    // Snapshot first, then topics, so no delta lands before the data it patches.
    // Cached data is refetched: the topics were closed while nobody watched.
    const hasData = query.getSnapshot().data !== undefined
    query.fetch({ force: hasData }).then(syncTopics, () => {})

    // Reconnect: messages sent while the socket was down are lost, so take a fresh snapshot.
    const offStatus = this.deps.realtime.onStatus((status) => {
      const reconnected = lastStatus === "inactive" && status === "active"
      lastStatus = status
      if (reconnected) query.fetch({ force: true }).then(syncTopics, () => {})
    })

    // The last watcher left: close everything.
    return () => {
      active = false
      offStatus()
      if (timer) clearTimeout(timer)
      pending.clear()
      for (const unsubscribe of topics.values()) unsubscribe()
      topics.clear()
    }
  }

  // ── API: one method per endpoint. HTTP only; wire types in and out ──

  private listFleets(opts: Signal) {
    return this.deps.http.get<ApiFleet[]>("/fleets", opts)
  }

  private vehicleDetails(fleetId: string, vehicleId: string, opts: Signal) {
    return this.deps.http.post<ApiVehicleDetails>(
      "/vehicles/details",
      { fleetid: fleetId, vehicleid: vehicleId },
      opts
    )
  }

  private liveInfoByFleet(fleetId: string, opts: Signal) {
    return this.deps.http.post<ApiVehicleLive[]>("/vehicles/liveinfo", { fleetid: fleetId }, opts)
  }
}
