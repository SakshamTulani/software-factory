import type { HttpClient } from "@/shared/api"

import { BaseCacheStore, type QueryObserver } from "../core"
import type { DataEvents } from "../events"
import {
  type ApiCommand,
  type ApiHistoryItem,
  type ApiSendCommand,
  toApiSendCommand,
  toCommand,
  toHistoryItem,
} from "./commandMappers"
import { sendCommandInputSchema } from "./schemas"
import type { Command, CommandHistoryItem, SendCommandInput } from "./types"

/** Every cache key this store uses. invalidateQueries() takes these, or a prefix of one. */
export const commandKeys = {
  commands: (fleetId: string, vehicleId: string) => ["commands", fleetId, vehicleId] as const,
  history: (fleetId: string, vehicleId: string) =>
    ["commands", "history", fleetId, vehicleId] as const,
}

/** How long each read stays fresh, in ms. */
const TTL = {
  commands: 30_000,
  history: 15_000,
}

type Signal = { signal: AbortSignal }

export type CommandStoreDeps = { http: HttpClient; events: DataEvents }

export class CommandStore extends BaseCacheStore {
  private readonly deps: CommandStoreDeps

  constructor(deps: CommandStoreDeps) {
    super()
    this.deps = deps
  }

  // ── Queries: cached reads, wire → entity ──

  getCommands(fleetId: string, vehicleId: string): QueryObserver<Command[]> {
    return this.queryCache.getQuery(
      commandKeys.commands(fleetId, vehicleId),
      async ({ signal }) =>
        (await this.listCommandsByVehicle(fleetId, vehicleId, { signal })).map(toCommand),
      { ttl: TTL.commands }
    )
  }

  getHistory(fleetId: string, vehicleId: string): QueryObserver<CommandHistoryItem[]> {
    return this.queryCache.getQuery(
      commandKeys.history(fleetId, vehicleId),
      async ({ signal }) =>
        (await this.listCommandUpdates(fleetId, vehicleId, { signal })).map(toHistoryItem),
      { ttl: TTL.history }
    )
  }

  // ── Mutations: write, then invalidate ──

  async sendCommand(input: SendCommandInput): Promise<void> {
    const valid = sendCommandInputSchema.parse(input) // a bad input never reaches the server
    await this.sendCommandToVehicle(toApiSendCommand(valid))
    // Its own query: invalidate it directly.
    this.invalidateQueries(commandKeys.history(input.fleetId, input.vehicleId))
    // Another store's data: announce what happened and let that store decide.
    this.deps.events.emit({
      type: "command/sent",
      fleetId: input.fleetId,
      vehicleId: input.vehicleId,
      commandId: input.commandId,
    })
  }

  // ── API: one method per endpoint. HTTP only; wire types in and out ──

  private listCommandsByVehicle(fleetId: string, vehicleId: string, opts: Signal) {
    return this.deps.http.post<ApiCommand[]>(
      "/commands/listcommandsbyvehicle",
      { fleetid: fleetId, vehicleid: vehicleId },
      opts
    )
  }

  private listCommandUpdates(fleetId: string, vehicleId: string, opts: Signal) {
    return this.deps.http.post<ApiHistoryItem[]>(
      "/commands/getcommandupdatesbyvehicle",
      { fleetid: fleetId, vehicleid: vehicleId },
      opts
    )
  }

  private sendCommandToVehicle(body: ApiSendCommand) {
    return this.deps.http.post<unknown>("/commands/sendcommandtovehicle", body)
  }
}
