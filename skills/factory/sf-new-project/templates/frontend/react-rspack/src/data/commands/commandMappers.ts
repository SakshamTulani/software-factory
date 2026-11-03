import type { Command, CommandHistoryItem, CommandStatus, SendCommandInput } from "./types"

// Wire types: exactly what the server sends and accepts.
export type ApiCommand = { cmdid: number; cmdname: string; needsconfirm: boolean }
export type ApiHistoryItem = { cmdid: number; cmdname: string; sentat: number; status: number }
export type ApiSendCommand = {
  fleetid: string
  vehicleid: string
  cmdid: number
  validtill: number
}

export const toCommand = (d: ApiCommand): Command => ({
  id: d.cmdid,
  name: d.cmdname,
  needsConfirmation: d.needsconfirm,
})

const STATUS: Record<number, CommandStatus> = {
  0: "pending",
  1: "delivered",
  2: "executed",
  3: "failed",
}

export const toHistoryItem = (d: ApiHistoryItem): CommandHistoryItem => ({
  commandId: d.cmdid,
  commandName: d.cmdname,
  sentAt: new Date(d.sentat),
  status: STATUS[d.status] ?? "failed",
})

export const toApiSendCommand = (input: SendCommandInput): ApiSendCommand => ({
  fleetid: input.fleetId,
  vehicleid: input.vehicleId,
  cmdid: input.commandId,
  validtill: input.validTill ? input.validTill.getTime() : -1,
})
