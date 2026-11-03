export type Command = {
  id: number
  name: string
  needsConfirmation: boolean
}

export type CommandStatus = "pending" | "delivered" | "executed" | "failed"

export type CommandHistoryItem = {
  commandId: number
  commandName: string
  sentAt: Date
  status: CommandStatus
}

export type SendCommandInput = {
  fleetId: string
  vehicleId: string
  commandId: number
  /** null: valid until the vehicle executes it. */
  validTill: Date | null
}
