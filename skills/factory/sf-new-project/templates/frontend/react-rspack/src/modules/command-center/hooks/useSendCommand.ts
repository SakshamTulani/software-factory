import { useMutation, useStores } from "@/bindings/react"
import type { SendCommandInput } from "@/data"

/** Write hook: tracks the request. The stores do every invalidation, so callers refresh nothing. */
export function useSendCommand() {
  const { commands } = useStores()
  return useMutation((input: SendCommandInput) => commands.sendCommand(input))
}
