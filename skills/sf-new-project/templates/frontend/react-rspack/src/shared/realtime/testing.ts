import type { RealtimeConnection, RealtimeMessage, RealtimeStatus } from "./connection"

export type FakeRealtimeConnection = RealtimeConnection & {
  /** Deliver a message as if the server had sent it. */
  emit(channel: string, topic: string, payload: unknown): void
  /** Change the connection status and notify listeners. */
  setStatus(status: RealtimeStatus): void
  /** The (channel, topic) pairs with at least one subscriber, as "channel/topic". */
  subscriptions(): string[]
}

const encoder = new TextEncoder()

/**
 * The fake socket every store test uses (see the frontend-testing skill).
 * Payloads are JSON-encoded to bytes, the way the real connection delivers them.
 */
export function createFakeRealtimeConnection(): FakeRealtimeConnection {
  const handlers = new Map<string, Set<(message: RealtimeMessage) => void>>()
  const statusListeners = new Set<(status: RealtimeStatus) => void>()
  let current: RealtimeStatus = "active"

  return {
    connect: () => {},
    disconnect: () => {},
    subscribe(channel, topic, onMessage) {
      const k = `${channel}/${topic}`
      const set = handlers.get(k) ?? new Set()
      handlers.set(k, set)
      set.add(onMessage)
      return () => {
        set.delete(onMessage)
        if (set.size === 0) handlers.delete(k)
      }
    },
    onStatus(listener) {
      statusListeners.add(listener)
      return () => statusListeners.delete(listener)
    },
    status: () => current,
    emit(channel, topic, payload) {
      const message = { channel, topic, payload: encoder.encode(JSON.stringify(payload)) }
      for (const handler of handlers.get(`${channel}/${topic}`) ?? []) handler(message)
    },
    setStatus(status) {
      current = status
      for (const listener of statusListeners) listener(status)
    },
    subscriptions: () => [...handlers.keys()].sort(),
  }
}
