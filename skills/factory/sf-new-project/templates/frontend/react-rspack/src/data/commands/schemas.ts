import { z } from "zod"

import type { SendCommandInput } from "./types"

/**
 * What a valid command looks like, before it reaches the server. sendCommand
 * parses with it; a form hook validates with it (or an extension of it) and
 * shows the messages. Typed against types.ts, so the two can't drift.
 */
export const sendCommandInputSchema = z.object({
  fleetId: z.string().min(1, "Choose a fleet."),
  vehicleId: z.string().min(1, "Choose a vehicle."),
  commandId: z.number().int().positive("Choose a command."),
  validTill: z
    .date()
    .refine((d) => d.getTime() > Date.now(), "Pick a time in the future.")
    .nullable(),
}) satisfies z.ZodType<SendCommandInput>
