import type { CommandHistoryItem, LiveInfo } from "@/data"

/** A vehicle that hasn't reported for this long can't receive commands. */
export const STALE_AFTER_MS = 10 * 60_000

/** A command may go only to a vehicle that reported recently. */
export function canSendCommand(live: LiveInfo | undefined, now: number): boolean {
  if (!live?.updatedAt) return false
  return now - live.updatedAt.getTime() < STALE_AFTER_MS
}

/** History reads newest first. */
export const newestFirst = (a: CommandHistoryItem, b: CommandHistoryItem) =>
  b.sentAt.getTime() - a.sentAt.getTime()
